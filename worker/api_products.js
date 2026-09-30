import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";


export async function handleProducts(
    request,
    env
){

    const user =
        await checkAuth(
            request,
            env
        );


    if(!user){

        return jsonResponse(
            {
                success:false,
                message:"Unauthorized"
            },
            401
        );

    }


    if(request.method !== "GET"){

        return jsonResponse(
            {
                success:false,
                message:
                    "Only GET is allowed for catalog products"
            },
            405
        );

    }


    return getCatalogProducts(
        request,
        env
    );

}



async function getCatalogProducts(
    request,
    env
){

    if(!env.META_ACCESS_TOKEN){

        return jsonResponse(
            {
                success:false,
                message:
                    "META_ACCESS_TOKEN is not configured"
            },
            500
        );

    }


    if(!env.META_CATALOG_ID){

        return jsonResponse(
            {
                success:false,
                message:
                    "META_CATALOG_ID is not configured"
            },
            500
        );

    }


    const version =
        env.META_GRAPH_API_VERSION ||
        "vXX.X";


    if(version === "vXX.X"){

        return jsonResponse(
            {
                success:false,
                message:
                    "META_GRAPH_API_VERSION is not configured"
            },
            500
        );

    }


    const url =
        new URL(request.url);


    const after =
        url.searchParams.get("after");


    const graphUrl =
        new URL(
            `https://graph.facebook.com/${version}/${env.META_CATALOG_ID}/products`
        );


    /*
     * Catalog fields
     */

    graphUrl.searchParams.set(
        "fields",
        [
            "id",
            "retailer_id",
            "name",
            "description",
            "price",
            "currency",
            "image_url",
            "availability",
            "brand",
            "condition",
            "url",
            "sale_price",
            "sale_price_effective_date"
        ].join(",")
    );


    graphUrl.searchParams.set(
        "limit",
        "100"
    );


    if(after){

        graphUrl.searchParams.set(
            "after",
            after
        );

    }


    graphUrl.searchParams.set(
        "access_token",
        env.META_ACCESS_TOKEN
    );


    try{

        const response =
            await fetch(
                graphUrl.toString()
            );


        const data =
            await response.json();


        if(!response.ok){

            console.error(
                "Meta Catalog API error:",
                data
            );


            return jsonResponse(
                {
                    success:false,
                    message:
                        data?.error?.message ||
                        "Unable to fetch Meta catalog products"
                },
                response.status
            );

        }


        const products =
            Array.isArray(data.data)

            ?

            data.data

            :

            [];


        return jsonResponse({

            success:true,

            products,

            paging:{

                next:
                    data.paging?.next ||
                    null,

                cursors:{

                    before:
                        data.paging?.cursors?.before ||
                        null,

                    after:
                        data.paging?.cursors?.after ||
                        null

                }

            }

        });

    }
    catch(error){

        console.error(
            "Meta Catalog request failed:",
            error
        );


        return jsonResponse(
            {
                success:false,
                message:
                    "Failed to connect to Meta Commerce Catalog"
            },
            500
        );

    }

}
