// worker.js

import { handleLogin } from "./auth.js";
import { handleCustomers } from "./customers.js";
import { handleProducts } from "./products.js";
import { handleOrders } from "./orders.js";
import { handleCampaigns } from "./campaigns.js";
import { handleMessages } from "./messages.js";



const corsHeaders = {

    "Access-Control-Allow-Origin":
    "https://whatsapp.mastain.in",

    "Access-Control-Allow-Headers":
    "Content-Type, Authorization",

    "Access-Control-Allow-Methods":
    "GET, POST, PUT, DELETE, OPTIONS"

};



function json(data, status = 200){

    return new Response(
        JSON.stringify(data),
        {
            status:status,
            headers:{
                "Content-Type":"application/json",
                ...corsHeaders
            }
        }
    );

}



export default {

async fetch(request, env){


    const url =
    new URL(request.url);



    // CORS preflight

    if(request.method === "OPTIONS"){

        return new Response(
            null,
            {
                headers:corsHeaders
            }
        );

    }





    // LOGIN

    if(
        url.pathname === "/login" &&
        request.method === "POST"
    ){

        return addCors(
            await handleLogin(
                request,
                env
            )
        );

    }






    // CUSTOMERS

    if(
        url.pathname === "/customers"
    ){

        return addCors(
            await handleCustomers(
                request,
                env
            )
        );

    }






    // PRODUCTS

    if(
        url.pathname === "/products"
    ){

        return addCors(
            await handleProducts(
                request,
                env
            )
        );

    }







    // ORDERS

    if(
        url.pathname === "/orders"
    ){

        return addCors(
            await handleOrders(
                request,
                env
            )
        );

    }








    // CAMPAIGNS

    if(
        url.pathname === "/campaigns"
    ){

        return addCors(
            await handleCampaigns(
                request,
                env
            )
        );

    }







    // MESSAGES

    if(
        url.pathname === "/messages"
    ){

        return addCors(
            await handleMessages(
                request,
                env
            )
        );

    }







    return json({

        success:false,

        message:"API running"

    },404);



}

};





function addCors(response){


    const headers =
    new Headers(
        response.headers
    );


    Object.entries(corsHeaders)
    .forEach(
        ([key,value])=>{

            headers.set(
                key,
                value
            );

        }
    );


    return new Response(
        response.body,
        {
            status:response.status,
            headers:headers
        }
    );

}
