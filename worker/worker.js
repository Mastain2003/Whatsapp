import { handleLogin } from "./auth.js";
import { handleCustomers } from "./customers.js";

//comment


const corsHeaders = {
  "Access-Control-Allow-Origin": "https://whatsapp.mastain.in",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization"
};


export default {

async fetch(request, env) {


    if(request.method === "OPTIONS"){
        return new Response(null,{
            headers:corsHeaders
        });
    }


    const url =
    new URL(request.url);



    if(url.pathname === "/login"){
        return handleLogin(
            request,
            env,
            corsHeaders
        );
    }



    if(url.pathname.startsWith("/customers")){
        return handleCustomers(
            request,
            env,
            corsHeaders
        );
    }



    return Response.json(
        {
            success:false,
            message:"API running"
        },
        {
            headers:corsHeaders
        }
    );


}

};
