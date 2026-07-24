// worker/worker.js


import {
    handleOptions,
    jsonResponse
} from "./cors_helper.js";


import {
    handleLogin
} from "./auth_service.js";





export default {


    async fetch(
        request,
        env
    ) {


        const url =
            new URL(request.url);



        const path =
            url.pathname;



        // CORS preflight

        if(
            request.method === "OPTIONS"
        ){

            return handleOptions();

        }





        // Login route

        if(
            path === "/login"
        ){

            return handleLogin(
                request,
                env
            );

        }





        // Health check

        if(
            path === "/"
        ){

            return jsonResponse({

                success:true,

                message:
                "WhatsApp API running"

            });

        }





        // Future modules

        /*
        
        Customers:
        /customers

        Products:
        /products

        Orders:
        /orders

        Campaigns:
        /campaigns

        Messages:
        /messages

        Settings:
        /settings

        Webhook:
        /webhook

        */




        return jsonResponse(

            {
                success:false,
                message:"Route not found"
            },

            404

        );


    }


};
