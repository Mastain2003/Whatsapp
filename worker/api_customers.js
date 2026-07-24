// worker/api_customers.js


import {
    jsonResponse
} from "./cors_helper.js";


import {
    checkAuth
} from "./auth_service.js";





function generateCustomerCode(id) {

    return "CUS" +
        String(id)
        .padStart(6, "0");

}






export async function handleCustomers(
    request,
    env
) {


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




    const url =
        new URL(request.url);



    const method =
        request.method;






    // GET CUSTOMERS

    if(
        method === "GET"
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



        return jsonResponse({

            success:true,

            customers:
            result.results

        });


    }








    // ADD CUSTOMER

    if(
        method === "POST"
    ){


        const body =
            await request.json();




        const insert =
            await env.DB
            .prepare(
                `
                INSERT INTO customers
                (
                    customer_code,
                    name,
                    designation,
                    department,
                    city,
                    phone
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `
            )
            .bind(

                "TEMP",

                body.name,

                body.designation,

                body.department,

                body.city,

                body.phone

            )
            .run();





        const id =
            insert.meta.last_row_id;




        const code =
            generateCustomerCode(id);





        await env.DB
        .prepare(
            `
            UPDATE customers
            SET customer_code = ?
            WHERE id = ?
            `
        )
        .bind(
            code,
            id
        )
        .run();





        return jsonResponse({

            success:true,

            message:
            "Customer added",

            customer_code:
            code,

            id

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
