// worker/excel_import.js


import {
    jsonResponse
} from "./cors_helper.js";


import {
    checkAuth
} from "./auth_service.js";




function generateCustomerCode(id){

    return "CUS" +
    String(id)
    .padStart(6,"0");

}





export async function importCustomers(
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




    const data =
        await request.json();




    if(!Array.isArray(data)){

        return jsonResponse(
            {
                success:false,
                message:"Invalid data format"
            },
            400
        );

    }





    let imported = 0;

    let skipped = 0;




    for(
        const customer of data
    ){



        const duplicate =
            await env.DB
            .prepare(
            `
            SELECT id
            FROM customers
            WHERE
            name = ?
            AND designation = ?
            AND department = ?
            AND city = ?
            AND phone = ?
            `
            )
            .bind(

                customer.name,

                customer.designation,

                customer.department,

                customer.city,

                customer.phone

            )
            .first();




        if(duplicate){

            skipped++;

            continue;

        }





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

                customer.name,

                customer.designation,

                customer.department,

                customer.city,

                customer.phone

            )
            .run();




        const id =
            insert.meta.last_row_id;




        await env.DB
        .prepare(
        `
        UPDATE customers
        SET customer_code = ?
        WHERE id = ?
        `
        )
        .bind(

            generateCustomerCode(id),

            id

        )
        .run();




        imported++;


    }





    return jsonResponse({

        success:true,

        imported,

        skipped

    });



}
