// customers.js

import { checkAuth } from "./auth.js";



export async function handleCustomers(
    request,
    env
){



    // Authentication

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





    // GET CUSTOMERS

    if(
        request.method === "GET"
    ){


        const result =
        await env.DB
        .prepare(
            `
            SELECT *
            FROM customers
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







    // ADD CUSTOMER

    if(
        request.method === "POST"
    ){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            INSERT INTO customers
            (
                name,
                phone,
                email,
                address
            )
            VALUES(?,?,?,?)
            `
        )
        .bind(
            body.name,
            body.phone,
            body.email,
            body.address
        )
        .run();



        return Response.json(
            {
                success:true,
                message:"Customer added"
            }
        );


    }








    // UPDATE CUSTOMER

    if(
        request.method === "PUT"
    ){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            UPDATE customers SET

            name=?,
            phone=?,
            email=?,
            address=?

            WHERE id=?

            `
        )
        .bind(

            body.name,
            body.phone,
            body.email,
            body.address,
            body.id

        )
        .run();




        return Response.json(
            {
                success:true,
                message:"Customer updated"
            }
        );


    }









    // DELETE CUSTOMER

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
            DELETE FROM customers
            WHERE id=?
            `
        )
        .bind(id)
        .run();




        return Response.json(
            {
                success:true,
                message:"Customer deleted"
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
