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



    if(
        request.method !== "POST"
    ){

        return jsonResponse(
        {
            success:false,
            message:"Method Not Allowed"
        },
        405
        );

    }



    const data =
    await request.json();



    if(
        !data.phone
        ||
        !data.template
    ){

        return jsonResponse(
        {
            success:false,
            message:"Phone and template required"
        },
        400
        );

    }



    const response =
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
            data.phone,


            type:
            "template",


            template:{

                name:
                data.template,


                language:{

                    code:"en_US"

                }

            }

        })

    });



    const result =
    await response.json();



    if(!response.ok){

        return jsonResponse(
        {
            success:false,
            meta_error:result
        },
        400
        );

    }



    return jsonResponse(
    {
        success:true,
        message:"WhatsApp message sent",
        result
    });

}
