import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

function generateProductCode(id){

    return "PRD" +
    String(id).padStart(6,"0");

}

export async function handleProducts(
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

    const url =
    new URL(request.url);

    const method =
    request.method;

    if(
        method === "GET"
    ){

        return getProducts(
            url,
            env
        );

    }

    if(
        method === "POST"
    ){

        return addProduct(
            request,
            env
        );

    }

    return jsonResponse(
        {
            success:false,
            message:"Method Not Allowed"
        },
        405
    );

}
