import { handleWhatsAppDashboard } from "./api_whatsapp_dashboard.js";
import { handleProducts } from "./api_products.js";
import { importCustomers } from "./excel_import.js";
import { handleOptions, jsonResponse } from "./cors_helper.js";
import { handleLogin, logout } from "./auth_service.js";
import { handleCustomers } from "./api_customers.js";
import { handleBroadcast } from "./api_broadcast.js";
import { handleWhatsApp } from "./api_whatsapp.js";
import { handleWhatsAppWebhook } from "./api_whatsapp_webhook.js";
import { handleTemplates, handleSendTemplate} from "./api_templates.js";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Frontend Pages
        /*
        if (path === "/") {
            return env.ASSETS.fetch(new Request(new URL("/pages/login.html", request.url)));
        }
        if (path === "/dashboard") {
            return env.ASSETS.fetch(new Request(new URL("/pages/dashboard.html", request.url)));
        }
        if (path === "/customers") {
            return env.ASSETS.fetch(new Request(new URL("/pages/customers.html", request.url)));
        }
        if (path === "/products") {
            return env.ASSETS.fetch(new Request(new URL("/pages/products.html", request.url)));
        }
        if (path === "/broadcast") {
            return env.ASSETS.fetch(new Request(new URL("/pages/broadcast.html", request.url)));
        }
        */

        // CORS
        if (request.method === "OPTIONS") {
            return handleOptions();
        }

        // Login
        if (path === "/login") {
            return handleLogin(request, env);
        }

        if (path === "/logout") {
            return logout(request, env);
        }

        // Customers
        if (path === "/customers/import") {
            console.log("importing customers");
            return importCustomers(request, env);
        }

        if (path.startsWith("/customers")) {
            return handleCustomers(request, env);
        }

        if (path.startsWith("/products")) {
            return handleProducts(request, env);
        }

        if (url.pathname === "/broadcast") {
            return handleBroadcast(request, env);
        }

        if (url.pathname === "/whatsapp/send") {
            return handleWhatsApp(request, env);
        }

        if (url.pathname === "/whatsapp/webhook") {
            return handleWhatsAppWebhook(request, env);
        }

        if (path === "/whatsapp/dashboard") {
            return handleWhatsAppDashboard(request, env);
        }

        if (path === "/templates") {
            return handleTemplates(request, env);
        }

        if (path === "/templates/send") {
            return handleSendTemplate(request, env);
        }

        // Health Check
        if (path === "/") {
            return jsonResponse({
                success: true,
                message: "WhatsApp API running"
            });
        }

        return jsonResponse(
            {
                success: false,
                message: "Route not found"
            },
            404
        );
    },

    // Scheduled Cron Handler for Daily 4 PM Email Report
    async scheduled(event, env, ctx) {
        ctx.waitUntil(sendDaily4PMEmailReport(env));
    }
};

// Helper: Daily 4 PM Pending Orders Email Report
async function sendDaily4PMEmailReport(env) {
    try {
        // Query pending orders with full customer info
        const pendingOrders = await env.DB.prepare(`
            SELECT 
                o.id AS order_id,
                o.created_at AS requested_at,
                c.name AS customer_name,
                c.phone AS whatsapp_number,
                c.designation AS post,
                c.department,
                c.city
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.status = 'PENDING_CONFIRMATION'
            ORDER BY o.created_at ASC
        `).all();

        const ordersList = pendingOrders.results || [];

        if (ordersList.length === 0) {
            console.log("No pending order requests for 4 PM report.");
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        let emailBody = `WhatsApp Order Requests — ${todayStr}\n\n`;

        for (let i = 0; i < ordersList.length; i++) {
            const order = ordersList[i];

            // Fetch ordered products for each pending request
            const items = await env.DB.prepare(`
                SELECT p.name AS product_name, oi.quantity 
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `).bind(order.order_id).all();

            const itemDetails = (items.results || [])
                .map(item => `${item.product_name || 'Product'} × ${item.quantity}`)
                .join('\n');

            emailBody += `${i + 1}. ${order.customer_name}\n\n`;
            emailBody += `WhatsApp:\n${order.whatsapp_number}\n\n`;
            
            if (order.post) {
                emailBody += `Post:\n${order.post}\n\n`;
            }
            if (order.department) {
                emailBody += `Department:\n${order.department}\n\n`;
            }
            
            emailBody += `City:\n${order.city || 'N/A'}\n\n`;
            emailBody += `Products:\n${itemDetails || 'No item details'}\n\n`;
            emailBody += `Status:\nPending Confirmation\n\n`;
            emailBody += `----------------------------------------\n\n`;
        }

        emailBody += `Total pending requests: ${ordersList.length}`;

        // Send Email via Resend API
        const adminEmail = env.ADMIN_REPORT_EMAIL || 'admin@example.com';
        if (env.RESEND_API_KEY) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'WhatsApp Admin <reports@yourdomain.com>',
                    to: [adminEmail],
                    subject: `WhatsApp Order Requests — ${todayStr}`,
                    text: emailBody
                })
            });
        }
    } catch (error) {
        console.error("Error generating 4 PM email report:", error);
    }
}
