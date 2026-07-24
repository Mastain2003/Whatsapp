// worker/auth_service.js


import { jsonResponse } from "./cors_helper.js";



// Temporary admin credentials
// Later these will move to Cloudflare secrets

const ADMIN_USERNAME = "admin";

const ADMIN_PASSWORD = "admin123";




// Create token

function createToken(username) {


    const payload = {

        username,

        createdAt: Date.now()

    };


    return btoa(
        JSON.stringify(payload)
    );


}




// Login handler

export async function handleLogin(
    request,
    env
) {


    if(request.method !== "POST"){

        return jsonResponse(
            {
                success:false,
                message:"Method not allowed"
            },
            405
        );

    }



    const body =
        await request.json();



    if(
        body.username !== ADMIN_USERNAME ||
        body.password !== ADMIN_PASSWORD
    ){

        return jsonResponse(

            {
                success:false,
                message:"Invalid login"
            },

            401

        );

    }



    const token =
        createToken(
            body.username
        );



    return jsonResponse({

        success:true,

        token

    });


}







// Check authentication

export async function checkAuth(
    request,
    env
) {


    const header =
        request.headers.get(
            "Authorization"
        );



    if(!header){

        return false;

    }



    if(
        !header.startsWith(
            "Bearer "
        )
    ){

        return false;

    }



    const token =
        header.replace(
            "Bearer ",
            ""
        );



    try{


        const decoded =
            JSON.parse(
                atob(token)
            );



        if(
            !decoded.username ||
            decoded.username !== ADMIN_USERNAME
        ){

            return false;

        }



        return true;


    }
    catch(error){

        return false;

    }


}
