// orders.js

import { checkAuth } from "./auth.js";


export async function handleOrders(request, env){


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





    // GET ORDERS

    if(request.method === "GET"){


        const orders =
        await env.DB
        .prepare(
            `
            SELECT *
            FROM orders
            ORDER BY id DESC
            `
        )
        .all();



        for(
            let order of orders.results
        ){

            const items =
            await env.DB
            .prepare(
                `
                SELECT *
                FROM order_items
                WHERE order_id=?
                `
            )
            .bind(order.id)
            .all();


            order.items =
            items.results;

        }



        return Response.json(
            {
                success:true,
                data:orders.results
            }
        );


    }









    // CREATE ORDER

    if(request.method === "POST"){


        const body =
        await request.json();



        const order =
        await env.DB
        .prepare(
            `
            INSERT INTO orders
            (
                phone,
                total,
                status
            )
            VALUES(?,?,?)
            `
        )
        .bind(

            body.phone,

            body.total,

            body.status || "pending"

        )
        .run();



        const orderId =
        order.meta.last_row_id;



        for(
            const item of body.items
        ){

            await env.DB
            .prepare(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES(?,?,?,?)
                `
            )
            .bind(

                orderId,

                item.product_id,

                item.quantity,

                item.price

            )
            .run();

        }




        return Response.json(
            {
                success:true,
                message:"Order created",
                id:orderId
            }
        );


    }









    // UPDATE ORDER STATUS

    if(request.method === "PUT"){


        const body =
        await request.json();



        await env.DB
        .prepare(
            `
            UPDATE orders
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
                message:"Order updated"
            }
        );


    }









    // DELETE ORDER

    if(request.method === "DELETE"){


        const id =
        url.searchParams.get(
            "id"
        );



        await env.DB
        .prepare(
            `
            DELETE FROM order_items
            WHERE order_id=?
            `
        )
        .bind(id)
        .run();



        await env.DB
        .prepare(
            `
            DELETE FROM orders
            WHERE id=?
            `
        )
        .bind(id)
        .run();



        return Response.json(
            {
                success:true,
                message:"Order deleted"
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
