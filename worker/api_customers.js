import {
    jsonResponse
} from "./cors_helper.js";

import {
    checkAuth
} from "./auth_service.js";

function generateCustomerCode(id) {
    return "CUS" + String(id).padStart(6, "0");
}

export async function handleCustomers(
    request,
    env
) {
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

    const url = new URL(request.url);
    const method = request.method;

    const pathParts = url.pathname
        .split("/")
        .filter(Boolean);

    const lastPart = pathParts[pathParts.length - 1];

    const customerId = (
        lastPart &&
        lastPart !== "customers" &&
        !isNaN(lastPart)
    )
    ? Number(lastPart)
    : null;

    /* =========================
       GET CUSTOMERS
    ========================= */

    if(method === "GET"){

        /*
         * GET /customers/123
         */
        if(customerId !== null){
            const result = await env.DB
                .prepare(
                    `
                    SELECT 
                        c.*,
                        s.last_customer_message,
                        COALESCE(s.window_active, 0) AS window_active
                    FROM customers c
                    LEFT JOIN whatsapp_sessions s ON c.id = s.customer_id
                    WHERE c.id = ?
                    `
                )
                .bind(customerId)
                .first();

            if(!result){
                return jsonResponse(
                    {
                        success: false,
                        message: "Customer not found"
                    },
                    404
                );
            }

            return jsonResponse({
                success: true,
                customer: result
            });
        }

        /*
         * GET /customers
         */
        let query = `
            SELECT 
                c.*,
                s.last_customer_message,
                COALESCE(s.window_active, 0) AS window_active
            FROM customers c
            LEFT JOIN whatsapp_sessions s ON c.id = s.customer_id
        `;

        const conditions = [];
        const values = [];

        const name = url.searchParams.get("name");
        const designation = url.searchParams.get("designation");
        const department = url.searchParams.get("department");
        const city = url.searchParams.get("city");
        const block = url.searchParams.get("block");
        const phone = url.searchParams.get("phone");

        if(name){
            conditions.push("c.name LIKE ?");
            values.push(`%${name}%`);
        }

        if(designation){
            conditions.push("c.designation LIKE ?");
            values.push(`%${designation}%`);
        }

        if(department){
            conditions.push("c.department LIKE ?");
            values.push(`%${department}%`);
        }

        if(city){
            conditions.push("c.city LIKE ?");
            values.push(`%${city}%`);
        }

        if(block){
            conditions.push("c.block LIKE ?");
            values.push(`%${block}%`);
        }

        if(phone){
            conditions.push("c.phone LIKE ?");
            values.push(`%${phone}%`);
        }

        if(conditions.length > 0){
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY c.id DESC";

        const result = await env.DB
            .prepare(query)
            .bind(...values)
            .all();

        return jsonResponse({
            success: true,
            customers: result.results
        });
    }

    /* =========================
       ADD CUSTOMER
    ========================= */

    if(
        method === "POST" &&
        customerId === null
    ){
        const body = await request.json();

        if(
            !body.name ||
            !body.phone
        ){
            return jsonResponse(
                {
                    success: false,
                    message: "Name and phone are required"
                },
                400
            );
        }

        const insert = await env.DB
            .prepare(
                `
                INSERT OR IGNORE INTO customers(
                    name,
                    designation,
                    department,
                    city,
                    block,
                    phone,
                    whatsapp_language,
                    marketing_opt_in
                )
                VALUES(
                    ?, ?, ?, ?, ?, ?, ?, ?
                )
                `
            )
            .bind(
                body.name,
                body.designation || "",
                body.department || "",
                body.city || "",
                body.block || "",
                body.phone,
                body.whatsapp_language || "en",
                body.marketing_opt_in !== undefined ? body.marketing_opt_in : 1
            )
            .run();

        if(!insert.meta.changes){
            return jsonResponse(
                {
                    success: false,
                    message: "Customer already exists"
                },
                409
            );
        }

        const id = insert.meta.last_row_id;
        const code = generateCustomerCode(id);

        await env.DB
            .prepare(
                `
                UPDATE customers
                SET customer_code = ?
                WHERE id = ?
                `
            )
            .bind(
                code,
                id
            )
            .run();

        return jsonResponse({
            success: true,
            message: "Customer added",
            customer_code: code,
            id: id
        });
    }

    /* =========================
       EDIT CUSTOMER
    ========================= */

    if(
        method === "PUT" &&
        customerId !== null
    ){
        const body = await request.json();

        if(
            !body.name ||
            !body.phone
        ){
            return jsonResponse(
                {
                    success: false,
                    message: "Name and phone are required"
                },
                400
            );
        }

        const result = await env.DB
            .prepare(
                `
                UPDATE customers
                SET
                    name = ?,
                    designation = ?,
                    department = ?,
                    city = ?,
                    block = ?,
                    phone = ?,
                    whatsapp_language = COALESCE(?, whatsapp_language),
                    marketing_opt_in = COALESCE(?, marketing_opt_in)
                WHERE id = ?
                `
            )
            .bind(
                body.name,
                body.designation || "",
                body.department || "",
                body.city || "",
                body.block || "",
                body.phone,
                body.whatsapp_language || null,
                body.marketing_opt_in !== undefined ? body.marketing_opt_in : null,
                customerId
            )
            .run();

        if(!result.meta.changes){
            return jsonResponse(
                {
                    success: false,
                    message: "Customer not found"
                },
                404
            );
        }

        return jsonResponse({
            success: true,
            message: "Customer updated"
        });
    }

    /* =========================
       DELETE CUSTOMER
    ========================= */

    if(
        method === "DELETE" &&
        customerId !== null
    ){
        const result = await env.DB
            .prepare(
                `
                DELETE FROM customers
                WHERE id = ?
                `
            )
            .bind(customerId)
            .run();

        if(!result.meta.changes){
            return jsonResponse(
                {
                    success: false,
                    message: "Customer not found"
                },
                404
            );
        }

        return jsonResponse({
            success: true,
            message: "Customer deleted"
        });
    }

    return jsonResponse(
        {
            success: false,
            message: "Method not allowed"
        },
        405
    );
}
