// worker/worker.js

import {
 handleWhatsAppDashboard
}
from "./api_whatsapp_dashboard.js";

import {
    handleProducts
} from "./api_products.js";

import {
    importCustomers
} from "./excel_import.js";

import {
    handleOptions,
    jsonResponse
} from "./cors_helper.js";


import {
    handleLogin,
 logout
} from "./auth_service.js";


import {
    handleCustomers
} from "./api_customers.js";

import {
    handleBroadcast
} from "./api_broadcast.js";

import { handleWhatsApp } from "./api_whatsapp.js";

import {
 handleWhatsAppWebhook
}
from "./api_whatsapp_webhook.js";



export default {


    async fetch(
        request,
        env
    ) {


        const url =
            new URL(request.url);


        const path =
            url.pathname;


        // Frontend Pages

/*if (path === "/") {

    return env.ASSETS.fetch(
        new Request(
            new URL(
                "/pages/login.html",
                request.url
            )
        )
    );

}


if (path === "/dashboard") {

    return env.ASSETS.fetch(
        new Request(
            new URL(
                "/pages/dashboard.html",
                request.url
            )
        )
    );

}


if (path === "/customers") {

    return env.ASSETS.fetch(
        new Request(
            new URL(
                "/pages/customers.html",
                request.url
            )
        )
    );

}


if (path === "/products") {

    return env.ASSETS.fetch(
        new Request(
            new URL(
                "/pages/products.html",
                request.url
            )
        )
    );

}


if (path === "/broadcast") {

    return env.ASSETS.fetch(
        new Request(
            new URL(
                "/pages/broadcast.html",
                request.url
            )
        )
    );

}*/



        // CORS

        if(
            request.method === "OPTIONS"
        ){

            return handleOptions();

        }





        // Login

        if(
            path === "/login"
        ){

            return handleLogin(
                request,
                env
            );

        }

     if (
    path === "/logout"
){

    return logout(
        request,
        env
    );

     }






        // Customers

      if(
    path === "/customers/import"
){

    return importCustomers(
        request,
        env
    );

}



if(
    path.startsWith("/customers")
){

    return handleCustomers(
        request,
        env
    );

}

        if(
    path.startsWith("/products")
){

    return handleProducts(
        request,
        env
    );

        }

        if(
    url.pathname === "/broadcast"
){

    return handleBroadcast(
        request,
        env
    );

        }
if(
    url.pathname === "/whatsapp/send"
){

    return handleWhatsApp(
        request,
        env
    );

}

        if(
 url.pathname === "/whatsapp/webhook"
){

 return handleWhatsAppWebhook(
    request,
    env
 );

        }

        if(
 path === "/whatsapp/dashboard"
){

    return handleWhatsAppDashboard(
        request,
        env
    );

        }





        // Health Check

        if(
            path === "/"
        ){

            return jsonResponse({

                success:true,

                message:
                "WhatsApp API running"

            });

        }






        return jsonResponse(

            {
                success:false,
                message:"Route not found"
            },

            404

        );


    }


};
