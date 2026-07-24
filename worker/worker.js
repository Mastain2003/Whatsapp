// worker/worker.js

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
    handleLogin
} from "./auth_service.js";


import {
    handleCustomers
} from "./api_customers.js";




export default {


    async fetch(
        request,
        env
    ) {


        const url =
            new URL(request.url);


        const path =
            url.pathname;



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
