// messages.js

import { checkAuth } from "./auth.js";


export async function handleMessages(
    request,
    env
){


    const allowed =
    await checkAuth(
        request,
        env
    );


    if(!allowed){

        return Response.json(
            {
                success:false,
                message:"Unauthorized"
            },
            {
                status:401
            }
        );

    }



    const url =
    new URL(request.url);






    // GET MESSAGES

    if(request.method === "GET"){


        const result =
        await env.DB
        .prepare(
            `
            SELECT *
            FROM messages
            ORDER BY id DESC
            `
        )
        .all();



        return Response.json(
            {
                success:true,
                data:result.results
            }
        );


    }









    // ADD MESSAGE

    if(request.method === "POST"){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            INSERT INTO messages
            (
                phone,
                message,
                status
            )
            VALUES(?,?,?)
            `
        )
        .bind(

            body.phone,

            body.message,

            body.status || "pending"

        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Message added"
            }
        );


    }









    // UPDATE MESSAGE STATUS

    if(request.method === "PUT"){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            UPDATE messages
            SET status=?
            WHERE id=?
            `
        )
        .bind(

            body.status,

            body.id

        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Message updated"
            }
        );


    }









    // DELETE MESSAGE

    if(request.method === "DELETE"){


        const id =
        url.searchParams.get(
            "id"
        );



        await env.DB
        .prepare(
            `
            DELETE FROM messages
            WHERE id=?
            `
        )
        .bind(id)
        .run();



        return Response.json(
            {
                success:true,
                message:"Message deleted"
            }
        );


    }








    return Response.json(
        {
            success:false,
            message:"Invalid request"
        },
        {
            status:400
        }
    );


}
