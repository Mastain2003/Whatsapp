// products.js

import { checkAuth } from "./auth.js";


export async function handleProducts(
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





    // GET PRODUCTS

    if(
        request.method === "GET"
    ){


        const result =
        await env.DB
        .prepare(
            `
            SELECT *
            FROM products
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







    // ADD PRODUCT

    if(
        request.method === "POST"
    ){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            INSERT INTO products
            (
                code,
                name,
                category,
                unit,
                price,
                gst
            )
            VALUES(?,?,?,?,?,?)
            `
        )
        .bind(

            body.code,
            body.name,
            body.category,
            body.unit,
            body.price,
            body.gst || 0

        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Product added"
            }
        );


    }








    // UPDATE PRODUCT

    if(
        request.method === "PUT"
    ){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            UPDATE products SET

            code=?,
            name=?,
            category=?,
            unit=?,
            price=?,
            gst=?

            WHERE id=?

            `
        )
        .bind(

            body.code,
            body.name,
            body.category,
            body.unit,
            body.price,
            body.gst || 0,
            body.id

        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Product updated"
            }
        );


    }









    // DELETE PRODUCT

    if(
        request.method === "DELETE"
    ){


        const id =
        url.searchParams.get(
            "id"
        );



        await env.DB
        .prepare(
            `
            DELETE FROM products
            WHERE id=?
            `
        )
        .bind(id)
        .run();



        return Response.json(
            {
                success:true,
                message:"Product deleted"
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
