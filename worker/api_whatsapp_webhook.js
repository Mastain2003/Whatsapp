import { jsonResponse } from "./cors_helper.js";



export async function handleWhatsAppWebhook(
    request,
    env
){


    const url =
    new URL(request.url);



    // Meta webhook verification

    if(
        request.method === "GET"
    ){

        const mode =
        url.searchParams.get(
            "hub.mode"
        );


        const token =
        url.searchParams.get(
            "hub.verify_token"
        );


        const challenge =
        url.searchParams.get(
            "hub.challenge"
        );



        if(
            mode === "subscribe"
            &&
            token === env.WHATSAPP_VERIFY_TOKEN
        ){

            return new Response(
                challenge
            );

        }



        return new Response(
            "Verification failed",
            {
                status:403
            }
        );

    }





    // Meta events

    if(
        request.method === "POST"
    ){

        const body =
        await request.json();



        console.log(
            JSON.stringify(body)
        );



        await processWebhook(
            body,
            env
        );



        return jsonResponse({
            success:true
        });

    }



    return jsonResponse(
    {
        success:false,
        message:"Method not allowed"
    },
    405
    );

}







async function processWebhook(
    body,
    env
){


    const entry =
    body.entry?.[0];


    const change =
    entry?.changes?.[0];


    const value =
    change?.value;



    if(!value){

        return;

    }



    // Message status update

    if(
        value.statuses
    ){

        for(
            const status of value.statuses
        ){

            await updateStatus(
                status,
                env
            );

        }

    }



    // Customer reply

    if(
        value.messages
    ){

        for(
            const message of value.messages
        ){

            await handleIncomingMessage(
                message,
                env
            );

        }

    }

}







async function updateStatus(
    status,
    env
){

    let column = null;


    if(
        status.status === "delivered"
    ){

        column =
        "delivered_at";

    }


    if(
        status.status === "read"
    ){

        column =
        "read_at";

    }



    if(!column){

        return;

    }



    await env.DB
    .prepare(
    `
    UPDATE whatsapp_messages
    SET
        status = ?,
        ${column}=CURRENT_TIMESTAMP
    WHERE whatsapp_message_id = ?
    `
    )
    .bind(

        status.status,

        status.id

    )
    .run();

}







async function handleIncomingMessage(
    message,
    env
){

    const phone =
    message.from;


    let messageText = "";

    let buttonId = "";



    if(
        message.type === "text"
    ){

        messageText =
        message.text.body;

    }



    if(
        message.type === "button"
    ){

        buttonId =
        message.button.payload
        ||
        message.button.text;

    }



    const customer =
    await env.DB
    .prepare(
    `
    SELECT id
    FROM customers
    WHERE phone = ?
    `
    )
    .bind(phone)
    .first();



    if(!customer){

        return;

    }



    await env.DB
    .prepare(
    `
    INSERT INTO whatsapp_incoming_messages
    (
        customer_id,
        whatsapp_message_id,
        message_type,
        message_text,
        button_id
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

        message.id,

        message.type,

        messageText,

        buttonId

    )
    .run();





    await env.DB
    .prepare(
    `
    INSERT INTO whatsapp_sessions
    (
        customer_id,
        last_customer_message,
        window_active
    )
    VALUES
    (
        ?,
        CURRENT_TIMESTAMP,
        1
    )

    ON CONFLICT(customer_id)
    DO UPDATE SET

    last_customer_message =
    CURRENT_TIMESTAMP,

    window_active = 1

    `
    )
    .bind(
        customer.id
    )
    .run();
if(buttonId){

    await processQuickReply(
        customer.id,
        buttonId,
        env
    );

}

}

async function processQuickReply(
    customerId,
    buttonId,
    env
){

    const customer =
    await env.DB
    .prepare(
    `
    SELECT
        phone,
        whatsapp_language
    FROM customers
    WHERE id = ?
    `
    )
    .bind(customerId)
    .first();



    if(!customer){

        return;

    }



    const reply =
    await env.DB
    .prepare(
    `
    SELECT reply_message
    FROM whatsapp_quick_replies
    WHERE button_id = ?
    AND language = ?
    `
    )
    .bind(
        buttonId,
        customer.whatsapp_language || "en"
    )
    .first();



    if(!reply){

        return;

    }



    await sendNormalMessage(
        customer.phone,
        reply.reply_message,
        env
    );

}





async function sendNormalMessage(
    phone,
    message,
    env
){

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
            "text",

            text:{

                body:
                message

            }

        })

    });

}
