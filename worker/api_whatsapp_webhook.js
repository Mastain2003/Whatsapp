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

    console.log(
        "Incoming message",
        message
    );

}
