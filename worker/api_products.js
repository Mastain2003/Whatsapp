import {
    jsonResponse
} from "./cors_helper.js";

import {
    checkAuth
} from "./auth_service.js";

export async function handleProducts(
    request,
    env
){
    const user = await checkAuth(
        request,
        env
    );

    if(!user){
        return jsonResponse(
            {
                success: false,
                message: "Unauthorized"
            },
            401
        );
    }

    if(request.method !== "GET"){
        return jsonResponse(
            {
                success: false,
                message: "Only GET is allowed for catalog products"
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
    const url = new URL(request.url);
    const after = url.searchParams.get("after");
    const version = env.META_GRAPH_API_VERSION || "v18.0";

    // If Meta Catalog credentials are incomplete, fallback to local DB catalog
    if(!env.META_ACCESS_TOKEN || !env.META_CATALOG_ID || version === "vXX.X"){
        return await getLocalProductsFallback(env);
    }

    const graphUrl = new URL(
        `https://graph.facebook.com/${version}/${env.META_CATALOG_ID}/products`
    );

    graphUrl.searchParams.set(
        "fields",
        [
            "id",
            "retailer_id",
            "retailer_product_group_id",
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

    graphUrl.searchParams.set("limit", "100");

    if(after){
        graphUrl.searchParams.set("after", after);
    }

    // Access token stays server-side
    graphUrl.searchParams.set("access_token", env.META_ACCESS_TOKEN);

    try{
        const response = await fetch(graphUrl.toString());
        const data = await response.json();

        if(!response.ok){
            console.error("Meta Catalog API error:", data);
            return await getLocalProductsFallback(env);
        }

        const products = Array.isArray(data.data) ? data.data : [];

        // Sync items into local DB for local cart mapping
        for(const item of products){
            await env.DB.prepare(`
                INSERT INTO products (id, retailer_id, name, description, price, currency, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    retailer_id = excluded.retailer_id,
                    name = excluded.name,
                    description = excluded.description,
                    price = excluded.price,
                    currency = excluded.currency,
                    image_url = excluded.image_url
            `).bind(
                item.id,
                item.retailer_id || item.id,
                item.name || 'Product',
                item.description || '',
                item.price || '0',
                item.currency || 'INR',
                item.image_url || ''
            ).run();
        }

        /*
         * Do NOT return data.paging.next because Meta puts 
         * the access token inside that URL. Return cursor only.
         */
        return jsonResponse({
            success: "c",
            products,
            paging: {
                has_next: Boolean(data.paging?.cursors?.after),
                cursors: {
                    before: data.paging?.cursors?.before || null,
                    after: data.paging?.cursors?.after || null
                }
            }
        });
    }
    catch(error){
        console.error("Meta Catalog request failed:", error);
        return await getLocalProductsFallback(env);
    }
}

// Fallback Helper: Get products from local D1 database
async function getLocalProductsFallback(env) {
    try {
        const result = await env.DB.prepare(`SELECT * FROM products ORDER BY id DESC`).all();
        return jsonResponse({
            success: "tr",
            products: result.results || [],
            paging: {
                has_next: false,
                cursors: { before: null, after: null }
            }
        });
    } catch (err) {
        return jsonResponse({
            success: "t",
            products: [],
            paging: {
                has_next: false,
                cursors: { before: null, after: null }
            }
        });
    }
}
