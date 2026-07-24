import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";


export async function handleWhatsApp(
    request,
    env
){

    const authorized =
    await checkAuth(
        request,
        env
    );


    if(!authorized){

        return jsonResponse(
        {
            success:false,
            message:"Unauthorized"
        },
        401
        );

    }


    const method =
    request.method;



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
        success:false,
        message:"Method Not Allowed"
    },
    405
    );

}

async function sendTemplate(
    request,
    env
){

    const data =
    await request.json();


    if(
        !data.template ||
        !Array.isArray(data.customer_ids) ||
        data.customer_ids.length === 0
    ){

        return jsonResponse(
        {
            success:false,
            message:"Template and customer ids required"
        },
        400
        );

    }


    let sent = 0;
    let failed = 0;



    for(
        const customerId of data.customer_ids
    ){

        const customer =
        await env.DB
        .prepare(
        `
        SELECT
            id,
            name,
            designation,
            department,
            city,
            phone,
            whatsapp_language
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



        try{


            if(!customer.phone){

                await saveFailedMessage(
                    customer,
                    data.template,
                    {
                        message:"Phone missing"
                    },
                    env
                );

                failed++;
                continue;

            }



            const phone =
            customer.phone.startsWith("91")
            ? customer.phone
            : "91" + customer.phone;



            const languageCode =
            customer.whatsapp_language === "hi"
            ? "hi_IN"
            : "en";



            const metaResponse =
            await fetch(
            `https://graph.facebook.com/v21.0/${env.PHONE_NUMBER_ID}/messages`,
            {

                method:"POST",

                headers:{

                    Authorization:
                    `Bearer ${env.WHATSAPP_TOKEN}`,

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    messaging_product:"whatsapp",

                    to:phone,

                    type:"template",

                    template:{

                        name:data.template,


                        language:{

                            code:languageCode

                        },


                        components:[

                        {

                            type:"body",

                            parameters:[

                            {
                                type:"text",
                                text:String(customer.name || "Customer")
                            },

                            {
                                type:"text",
                                text:String(customer.designation || "N/A")
                            },

                            {
                                type:"text",
                                text:String(customer.department || "N/A")
                            },

                            {
                                type:"text",
                                text:String(customer.city || "N/A")
                            },

                            {
                                type:"text",
                                text:"9955160127"
                            }

                            ]

                        }

                        ]

                    }

                })

            });



            const result =
            await metaResponse.json();



            if(metaResponse.ok){


                await env.DB
                .prepare(
                `
                INSERT INTO whatsapp_messages
                (
                    customer_id,
                    direction,
                    template_name,
                    whatsapp_message_id,
                    status,
                    sent_at
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    CURRENT_TIMESTAMP
                )
                `
                )
                .bind(

                    customer.id,

                    "outgoing",

                    data.template,

                    result.messages[0].id,

                    "sent"

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
                {
                    message:error.message
                },
                env
            );


            failed++;

        }


    }



    return jsonResponse({

        success:true,

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

    await env.DB
    .prepare(
    `
    INSERT INTO whatsapp_messages
    (
        customer_id,
        direction,
        template_name,
        status,
        failed_reason
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?
    )
    `
    )
    .bind(

        customer.id,

        "outgoing",

        template,

        "failed",

        error.message || JSON.stringify(error)

    )
    .run();

}




async function getMessages(
    env
){

    const result =
    await env.DB
    .prepare(
    `
    SELECT
        whatsapp_messages.*,
        customers.name,
        customers.phone
    FROM whatsapp_messages

    LEFT JOIN customers

    ON customers.id =
    whatsapp_messages.customer_id

    ORDER BY
    whatsapp_messages.created_at DESC
    `
    )
    .all();



    return jsonResponse({

        success:true,

        messages:
        result.results

    });

}
