export async function handleBroadcast(
    request,
    env
) {


    if(request.method !== "POST"){

        return Response.json(
        {
            success:false,
            message:"Method not allowed"
        },
        {
            status:405
        });

    }



    try {


        const body =
        await request.json();



        const message =
        body.message;



        const customers =
        body.customers || [];



        if(
            !message ||
            customers.length === 0
        ){

            return Response.json(
            {
                success:false,
                message:"Message and customers required"
            },
            {
                status:400
            });

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

            message,

            customers.length,

            "pending"

        )
        .run();





        return Response.json(
        {
            success:true,
            message:"Broadcast saved"
        });




    } catch(error){


        return Response.json(
        {
            success:false,
            message:error.message
        },
        {
            status:500
        });


    }


}
