import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

export async function handleBroadcast(
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

    if(method === "GET"){
        return getBroadcasts(
            env
        );
    }

    if(method === "POST"){
        return addBroadcast(
            request,
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

async function getBroadcasts(
    env
){
    const result = await env.DB
        .prepare(
            `
            SELECT *
            FROM broadcast_history
            ORDER BY created_at DESC
            `
        )
        .all();

    return jsonResponse({
        success: true,
        broadcasts: result.results
    });
}

async function addBroadcast(
    request,
    env
){
    const data = await request.json();

    if(!data.message){
        return jsonResponse(
            {
                success: false,
                message: "Message required"
            },
            400
        );
    }

    if(
        !Array.isArray(data.customers) ||
        data.customers.length === 0
    ){
        return jsonResponse(
            {
                success: false,
                message: "Customers required"
            },
            400
        );
    }

    // 1. Log Broadcast Summary into broadcast_history
    const broadcastResult = await env.DB
        .prepare(
            `
            INSERT INTO broadcast_history
            (
                message,
                total_customers,
                status
            )
            VALUES
            (
                ?,
                ?,
                'processing'
            )
            RETURNING id
            `
        )
        .bind(
            data.message,
            data.customers.length
        )
        .first();

    const broadcastId = broadcastResult ? broadcastResult.id : null;

    let sentCount = 0;
    let failedCount = 0;

    // 2. Dispatch Broadcast to Each Eligible Customer
    for (const customerId of data.customers) {
        const customer = await env.DB
            .prepare(
                `
                SELECT c.id, c.phone, c.marketing_opt_in, s.window_active
                FROM customers c
                LEFT JOIN whatsapp_sessions s ON c.id = s.customer_id
                WHERE c.id = ?
                `
            )
            .bind(customerId)
            .first();

        if (!customer) {
            failedCount++;
            continue;
        }

        // Compliance Check: Skip opted-out customers
        if (customer.marketing_opt_in === 0) {
            await env.DB.prepare(`
                INSERT INTO messages_v2 (
                    customer_id, direction, sender_type, message_type, 
                    message_text, status, error_code, failed_at
                ) VALUES (?, 'OUTBOUND', 'BROADCAST', 'FREE_TEXT', ?, 'FAILED', 'Customer unsubscribed', CURRENT_TIMESTAMP)
            `).bind(customer.id, data.message).run();

            failedCount++;
            continue;
        }

        try {
            const cleanPhone = String(customer.phone).replace(/\D/g, "");
            const phone = cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone;

            const url = `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
            const metaRes = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: phone,
                    type: "text",
                    text: { body: data.message }
                })
            });

            const resData = await metaRes.json();

            if (metaRes.ok) {
                const waMsgId = resData.messages?.[0]?.id || null;

                await env.DB.prepare(`
                    INSERT INTO messages_v2 (
                        customer_id, whatsapp_message_id, direction, sender_type,
                        message_type, message_text, status, sent_at
                    ) VALUES (?, ?, 'OUTBOUND', 'BROADCAST', 'FREE_TEXT', ?, 'SENT', CURRENT_TIMESTAMP)
                `).bind(customer.id, waMsgId, data.message).run();

                sentCount++;
            } else {
                const errorMsg = resData.error?.message || "WhatsApp API send failure";

                await env.DB.prepare(`
                    INSERT INTO messages_v2 (
                        customer_id, direction, sender_type, message_type,
                        message_text, status, error_code, failed_at
                    ) VALUES (?, 'OUTBOUND', 'BROADCAST', 'FREE_TEXT', ?, 'FAILED', ?, CURRENT_TIMESTAMP)
                `).bind(customer.id, data.message, errorMsg).run();

                failedCount++;
            }
        } catch (err) {
            await env.DB.prepare(`
                INSERT INTO messages_v2 (
                    customer_id, direction, sender_type, message_type,
                    message_text, status, error_code, failed_at
                ) VALUES (?, 'OUTBOUND', 'BROADCAST', 'FREE_TEXT', ?, 'FAILED', ?, CURRENT_TIMESTAMP)
            `).bind(customer.id, data.message, err.message).run();

            failedCount++;
        }
    }

    // 3. Update Broadcast Final Status
    if (broadcastId) {
        await env.DB.prepare(`
            UPDATE broadcast_history
            SET status = 'completed'
            WHERE id = ?
        `).bind(broadcastId).run();
    }

    return jsonResponse({
        success: true,
        message: "Broadcast processed successfully",
        sent: sentCount,
        failed: failedCount
    });
}
