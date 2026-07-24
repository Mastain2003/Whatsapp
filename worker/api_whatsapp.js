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
        !Array.isArray(data.customers) ||
        data.customers.length === 0
    ){

        return jsonResponse(
        {
            success:false,
            message:"Template and customers required"
        },
        400
        );

    }



    let sent = 0;
    let failed = 0;



    for(
        const customer of data.customers
    ){

        try{


            const languageCode =
            customer.whatsapp_language === "hi"
            ? "hi_IN"
            : "en_US";



            const phone = "919955160127";
           /* customer.phone.startsWith("91")
            ? customer.phone
            : "91" + customer.phone;*/



            const metaResponse =
            await fetch(
            `https://graph.facebook.com/v21.0/${env.PHONE_NUMBER_ID}/messages`,
            {

                method:"POST",

                headers:{

                    "Authorization":
                    `Bearer ${env.WHATSAPP_TOKEN}`,

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    messaging_product:
                    "whatsapp",


                    to:
                    phone,


                    type:
                    "template",



                    template:{

                        name:
                        data.template,


                        language:{

                            code:
                            languageCode

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
}/*,

                            {
                                type:"text",
                                text:customer.city || ""
                            },

                            {
                                type:"text",
                                text:"xxxxxxxxxx"
                            }*/

                            ]

                        }

                        ]

                    }

                })

            });



            const metaResult =
            await metaResponse.json();



            if(metaResponse.ok){

                const messageId =
                metaResult.messages[0].id;


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

                    messageId,

                    "sent"

                )
                .run();


                sent++;


            }
            else{


                await saveFailedMessage(
                    customer,
                    data.template,
                    metaResult,
                    env
                );


                failed++;

            }


        }
        catch(error){


            await saveFailedMessage(
                customer,
                data.template,
                error,
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
