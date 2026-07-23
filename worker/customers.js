import { checkAuth } from "./utils.js";


export async function handleCustomers(
    request,
    env,
    corsHeaders
){

    if(!(await checkAuth(request, env))){

        return Response.json(
            {
                success:false,
                message:"Unauthorized"
            },
            {
                status:401,
                headers:corsHeaders
            }
        );

    }



    const url =
    new URL(request.url);



    // GET CUSTOMERS
    if(
        request.method === "GET" &&
        url.pathname === "/customers"
    ){

        const data =
        await env.DB
        .prepare(
            "SELECT * FROM customers ORDER BY id DESC"
        )
        .all();



        return Response.json(
            data,
            {
                headers:corsHeaders
            }
        );

    }



    // ADD CUSTOMER
    if(
        request.method === "POST" &&
        url.pathname === "/customers"
    ){

        const body =
        await request.json();



        await env.DB
        .prepare(`
            INSERT INTO customers
            (
                name,
                designation,
                department,
                city,
                phone
            )
            VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
            body.name,
            body.designation,
            body.department,
            body.city,
            body.phone
        )
        .run();



        return Response.json(
            {
                success:true
            },
            {
                headers:corsHeaders
            }
        );

    }



    // DELETE CUSTOMER
    if(
        request.method === "DELETE"
    ){

        const id =
        url.pathname.split("/")[2];


        await env.DB
        .prepare(
            "DELETE FROM customers WHERE id=?"
        )
        .bind(id)
        .run();



        return Response.json(
            {
                success:true
            },
            {
                headers:corsHeaders
            }
        );

    }



    return Response.json(
        {
            success:false,
            message:"Invalid customer request"
        },
        {
            status:404,
            headers:corsHeaders
        }
    );

}
