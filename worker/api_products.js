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

    if(
    method === "PUT"
){

    return updateProduct(
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


async function getProducts(
    url,
    env
){

    const name =
    url.searchParams.get("name") || "";

    const category =
    url.searchParams.get("category") || "";

    const brand =
    url.searchParams.get("brand") || "";


    let sql =
    `
    SELECT *
    FROM products
    WHERE 1=1
    `;

    const params = [];


    if(name){

        sql +=
        " AND name LIKE ?";

        params.push(
            "%" + name + "%"
        );

    }


    if(category){

        sql +=
        " AND category = ?";

        params.push(
            category
        );

    }


    if(brand){

        sql +=
        " AND brand = ?";

        params.push(
            brand
        );

    }


    sql +=
    " ORDER BY name";


    const stmt =
    env.DB.prepare(sql);

    const result =
    await stmt
    .bind(...params)
    .all();


    return jsonResponse({

        success:true,

        products:
        result.results

    });

}

async function addProduct(
    request,
    env
){

    const data =
    await request.json();


    if(
        !data.name
    ){

        return jsonResponse(
            {
                success:false,
                message:"Product name is required"
            },
            400
        );

    }


    const duplicate =
    await env.DB
    .prepare(
    `
    SELECT id
    FROM products
    WHERE name = ?
    AND category = ?
    AND brand = ?
    `
    )
    .bind(

        data.name,

        data.category || "",

        data.brand || ""

    )
    .first();


    if(duplicate){

        return jsonResponse(
            {
                success:false,
                message:"Product already exists"
            },
            409
        );

    }


    const insert =
    await env.DB
    .prepare(
    `
    INSERT INTO products
    (
        product_code,
        name,
        category,
        brand,
        unit,
        price,
        image_url,
        description
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
    `
    )
    .bind(

        "TEMP",

        data.name,

        data.category || "",

        data.brand || "",

        data.unit || "",

        data.price || 0,

        data.image_url || "",

        data.description || ""

    )
    .run();


    const id =
    insert.meta.last_row_id;


    const productCode =
    generateProductCode(id);


    await env.DB
    .prepare(
    `
    UPDATE products
    SET product_code = ?
    WHERE id = ?
    `
    )
    .bind(

        productCode,

        id

    )
    .run();


    return jsonResponse({

        success:true,

        product_code:
        productCode

    });

}

async function updateProduct(
    request,
    env
){

    const data =
    await request.json();


    if(!data.id){

        return jsonResponse(
            {
                success:false,
                message:"Product id required"
            },
            400
        );

    }


    await env.DB
    .prepare(
    `
    UPDATE products
    SET
        name = ?,
        category = ?,
        brand = ?,
        unit = ?,
        price = ?,
        image_url = ?,
        description = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `
    )
    .bind(

        data.name || "",

        data.category || "",

        data.brand || "",

        data.unit || "",

        data.price || 0,

        data.image_url || "",

        data.description || "",

        data.id

    )
    .run();



    return jsonResponse({

        success:true,

        message:"Product updated"

    });

}
