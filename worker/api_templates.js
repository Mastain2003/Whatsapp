import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

export async function handleTemplates(
    request,
    env
){
console.log(
    request.headers.get("Authorization")
);
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

    if(request.method !== "GET"){

        return jsonResponse(
            {
                success:false,
                message:"Method not allowed"
            },
            405
        );

    }

    try{

        const response =
            await fetch(

                `https://graph.facebook.com/v23.0/${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,

                {

                    headers:{

                        Authorization:
                        `Bearer ${env.WHATSAPP_SEND_TOKEN}`

                    }

                }

            );

        const result =
            await response.json();

        if(!response.ok){

            return jsonResponse(
                {
                    success:false,
                    message:"Meta API Error",
                    error:result
                },
                response.status
            );

        }

        return jsonResponse({

            success:true,

            templates:
            result.data || []

        });

    }

    catch(error){

        return jsonResponse(
            {
                success:false,
                message:error.message
            },
            500
        );

    }

}
