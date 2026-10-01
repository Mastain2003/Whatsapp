// worker/excel_import.js

import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

function generateCustomerCode(id) {
    return "CUS" + String(id).padStart(6, "0");
}

export async function importCustomers(request, env) {
    try {
        const authorized = await checkAuth(request, env);
        if (!authorized) {
            return jsonResponse({ success: false, message: "Unauthorized" }, 401);
        }

        if (request.method !== "POST") {
            return jsonResponse({ success: false, message: "Method not allowed" }, 405);
        }

        const data = await request.json();
        if (!Array.isArray(data)) {
            return jsonResponse({ success: false, message: "Invalid data format" }, 400);
        }

        const statements = [];

        for (const customer of data) {
            statements.push(
                env.DB.prepare(`
                    INSERT OR IGNORE INTO customers (
                        name,
                        designation,
                        department,
                        city,
                        block,
                        phone
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
                    customer.name,
                    customer.designation,
                    customer.department,
                    customer.city,
                    customer.block,
                    customer.phone
                )
            );
        }

        // Execute batch operations
        const results = await env.DB.batch(statements);

        let imported = 0;
        let skipped = 0;

        // Iterate through batch execution results
        for (const res of results) {
            if (res.meta && res.meta.changes > 0) {
                imported++;
            } else {
                skipped++;
            }
        }

        return jsonResponse({
            success: true,
            imported,
            skipped
        });

    } catch (error) {
        console.error("Customer import failed:", error);
        return jsonResponse(
            {
                success: false,
                message: error.message
            },
            500
        );
    }
}
