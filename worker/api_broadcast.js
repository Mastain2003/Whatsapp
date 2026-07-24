import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";


export async function handleBroadcast(
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



    if(
        method === "GET"
    ){

        return getBroadcasts(
            env
        );

    }



    if(
        method === "POST"
    ){

        return addBroadcast(
            request,
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







async function getBroadcasts(
    env
){

    const result =
    await env.DB
    .prepare(
    `
    SELECT *
    FROM broadcast_history
    ORDER BY created_at DESC
    `
    )
    .all();



    return jsonResponse({

        success:true,

        broadcasts:
        result.results

    });

}








async function addBroadcast(
    request,
    env
){

    const data =
    await request.json();



    if(
        !data.message
    ){

        return jsonResponse(
            {
                success:false,
                message:"Message required"
            },
            400
        );

    }



    if(
        !Array.isArray(
            data.customers
        )
        ||
        data.customers.length === 0
    ){

        return jsonResponse(
            {
                success:false,
                message:"Customers required"
            },
            400
        );

    }




    await env.DB
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
        ?
    )
    `
    )
    .bind(

        data.message,

        data.customers.length,

        "pending"

    )
    .run();





    return jsonResponse({

        success:true,

        message:"Broadcast saved"

    });

}
