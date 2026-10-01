import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

export async function handleWhatsApp(
    request,
    env
){
    const user = await checkAuth(
        request,
        env
    );

    if(!user){
        return jsonResponse(
            {
                success: false,
                message: "Unauthorized"
            },
            401
        );
    }

    const method = request.method;

    if(method === "POST"){
        return sendTemplate(
            request,
            env
        );
    }

    if(method === "GET"){
        return getMessages(
            env
        );
    }

    return jsonResponse(
        {
            success: false,
            message: "Method Not Allowed"
        },
        405
    );
}

async function sendTemplate(
    request,
    env
){
    const data = await request.json();

    if(
        !data.template ||
        !Array.isArray(data.customer_ids) ||
        data.customer_ids.length === 0
    ){
        return jsonResponse(
            {
                success: false,
                message: "Template and customer ids required"
            },
            400
        );
    }

    const languageCode = data.language || "en";

    let sent = 0;
    let failed = 0;

    for(
        const customerId of data.customer_ids
    ){
        const customer = await env.DB
            .prepare(
                `
                SELECT
                    id,
                    name,
                    designation,
                    department,
                    city,
                    phone,
                    marketing_opt_in
                FROM customers
                WHERE id = ?
                `
            )
            .bind(customerId)
            .first();

        if(!customer){
            failed++;
            continue;
        }

        // Compliance Check: Skip customers who opted out (UNSUBSCRIBE)
        if(customer.marketing_opt_in === 0){
            await saveFailedMessage(
                customer,
                data.template,
                { message: "Customer unsubscribed from promotional messages" },
                env
            );
            failed++;
            continue;
        }

        try{
            if(!customer.phone){
                await saveFailedMessage(
                    customer,
                    data.template,
                    { message: "Phone number missing" },
                    env
                );
                failed++;
                continue;
            }

            const cleanPhone = String(customer.phone).replace(/\D/g,"");

            const phone = cleanPhone.startsWith("91")
                ? cleanPhone
                : "91" + cleanPhone;

            const metaResponse = await fetch(
                `https://graph.facebook.com/v21.0/${env.PHONE_NUMBER_ID}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${env.WHATSAPP_SEND_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: phone,
                        type: "template",
                        template: {
                            name: data.template,
                            language: {
                                code: languageCode
                            },
                            components: [
                                // Header image start
                                {
                                    type: "header",
                                    parameters: [
                                        {
                                            type: "image",
                                            image: {
                                                link: "https://whatsapp.mastain.in/img/1784960031243.png"
                                            }
                                        }
                                    ]
                                },
                                // Header image end
                                {
                                    type: "body",
                                    parameters: [
                                        {
                                            type: "text",
                                            text: String(customer.name || "Customer")
                                        },
                                        {
                                            type: "text",
                                            text: String(customer.department || "N/A")
                                        },
                                        {
                                            type: "text",
                                            text: String(customer.city || "N/A")
                                        }
                                    ]
                                }
                            ]
                        }
                    })
                }
            );

            const result = await metaResponse.json();

            if(metaResponse.ok){
                await env.DB
                    .prepare(
                        `
                        INSERT INTO messages_v2
                        (
                            customer_id,
                            direction,
                            sender_type,
                            message_type,
                            template_name,
                            whatsapp_message_id,
                            status,
                            sent_at
                        )
                        VALUES
                        (
                            ?,
                            'OUTBOUND',
                            'ADMIN',
                            'TEMPLATE',
                            ?,
                            ?,
                            'SENT',
                            CURRENT_TIMESTAMP
                        )
                        `
                    )
                    .bind(
                        customer.id,
                        data.template,
                        result.messages[0].id
                    )
                    .run();

                sent++;
            }
            else{
                await saveFailedMessage(
                    customer,
                    data.template,
                    result,
                    env
                );

                failed++;
            }
        }
        catch(error){
            await saveFailedMessage(
                customer,
                data.template,
                { message: error.message },
                env
            );

            failed++;
        }
    }

    return jsonResponse({
        success: true,
        sent,
        failed
    });
}

async function saveFailedMessage(
    customer,
    template,
    error,
    env
){
    let reason = "";

    try{
        if(typeof error === "string"){
            reason = error;
        }
        else if(error?.error?.message){
            reason = error.error.message;

            if(error.error.error_data?.details){
                reason += " | " + error.error.error_data.details;
            }
        }
        else if(error?.message){
            reason = error.message;
        }
        else{
            reason = JSON.stringify(error);
        }
    }
    catch{
        reason = "Unknown error";
    }

    await env.DB
        .prepare(
            `
            INSERT INTO messages_v2
            (
                customer_id,
                direction,
                sender_type,
                message_type,
                template_name,
                status,
                error_code,
                failed_at
            )
            VALUES
            (
                ?,
                'OUTBOUND',
                'ADMIN',
                'TEMPLATE',
                ?,
                'FAILED',
                ?,
                CURRENT_TIMESTAMP
            )
            `
        )
        .bind(
            customer.id,
            template,
            reason
        )
        .run();
}

async function getMessages(
    env
){
    const result = await env.DB
        .prepare(
            `
            SELECT
                messages_v2.*,
                customers.name,
                customers.phone
            FROM messages_v2
            LEFT JOIN customers
            ON customers.id = messages_v2.customer_id
            ORDER BY messages_v2.created_at DESC
            `
        )
        .all();

    return jsonResponse({
        success: true,
        messages: result.results
    });
}
