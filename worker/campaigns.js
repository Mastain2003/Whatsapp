// campaigns.js

import { checkAuth } from "./auth.js";


export async function handleCampaigns(
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





    // GET CAMPAIGNS

    if(request.method === "GET"){


        const result =
        await env.DB
        .prepare(
            `
            SELECT *
            FROM campaigns
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








    // ADD CAMPAIGN

    if(request.method === "POST"){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            INSERT INTO campaigns
            (
                name,
                language,
                message
            )
            VALUES(?,?,?)
            `
        )
        .bind(

            body.name,

            body.language,

            body.message

        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Campaign created"
            }
        );


    }








    // UPDATE CAMPAIGN

    if(request.method === "PUT"){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            UPDATE campaigns SET

            name=?,
            language=?,
            message=?

            WHERE id=?

            `
        )
        .bind(

            body.name,

            body.language,

            body.message,

            body.id

        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Campaign updated"
            }
        );


    }








    // DELETE CAMPAIGN

    if(request.method === "DELETE"){


        const id =
        url.searchParams.get(
            "id"
        );



        await env.DB
        .prepare(
            `
            DELETE FROM campaigns
            WHERE id=?
            `
        )
        .bind(id)
        .run();



        return Response.json(
            {
                success:true,
                message:"Campaign deleted"
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
