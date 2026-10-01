import { corsHeaders } from './cors_helper.js';

export async function handleWhatsAppWebhook(request, env) {
    if (request.method === 'GET') {
        // Webhook verification challenge
        const url = new URL(request.url);
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');

        if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
            return new Response(challenge, { status: 200 });
        }
        return new Response('Forbidden', { status: 403 });
    }

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const payload = await request.json();

    // Process incoming message entry
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
        return new Response('OK', { status: 200 });
    }

    // 1. Process WhatsApp Message Status Updates (SENT, DELIVERED, READ, FAILED)
    if (value.statuses && value.statuses.length > 0) {
        const statusObj = value.statuses[0];
        const waMsgId = statusObj.id;
        const status = statusObj.status; // sent, delivered, read, failed

        await env.DB.prepare(`
            UPDATE messages_v2 
            SET status = ?, 
                delivered_at = CASE WHEN ? = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
                read_at = CASE WHEN ? = 'read' THEN CURRENT_TIMESTAMP ELSE read_at END,
                failed_at = CASE WHEN ? = 'failed' THEN CURRENT_TIMESTAMP ELSE failed_at END
            WHERE whatsapp_message_id = ?
        `).bind(status.toUpperCase(), status, status, status, waMsgId).run();

        return new Response('OK', { status: 200 });
    }

    // 2. Process Incoming Messages
    const message = value.messages?.[0];
    const contact = value.contacts?.[0];

    if (!message || !contact) {
        return new Response('OK', { status: 200 });
    }

    const waPhone = contact.wa_id;
    const waName = contact.profile?.name || 'Customer';
    const waMsgId = message.id;

    // Fetch or create customer profile
    let customer = await env.DB.prepare(`SELECT * FROM customers WHERE phone = ?`).bind(waPhone).first();
    if (!customer) {
        const res = await env.DB.prepare(`
            INSERT INTO customers (name, phone, whatsapp_language, marketing_opt_in, status)
            VALUES (?, ?, 'en', 1, 'active')
            RETURNING *
        `).bind(waName, waPhone).first();
        customer = res;
    }

    // Update 24-hour customer service window
    await env.DB.prepare(`
        INSERT INTO whatsapp_sessions (customer_id, last_customer_message, window_active, updated_at)
        VALUES (?, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(customer_id) DO UPDATE SET 
            last_customer_message = CURRENT_TIMESTAMP,
            window_active = 1,
            updated_at = CURRENT_TIMESTAMP
    `).bind(customer.id).run();

    // Extract message content
    let rawText = '';
    let buttonId = null;
    let messageType = message.type.toUpperCase();

    if (message.type === 'text') {
        rawText = message.text?.body?.trim() || '';
    } else if (message.type === 'interactive') {
        if (message.interactive.type === 'button_reply') {
            buttonId = message.interactive.button_reply.id;
            rawText = message.interactive.button_reply.title;
        } else if (message.interactive.type === 'list_reply') {
            buttonId = message.interactive.list_reply.id;
            rawText = message.interactive.list_reply.title;
        }
    } else if (message.type === 'order') {
        // Native WhatsApp Cart Submission
        return await handleCartSubmission(customer, message, env);
    }

    // Record Inbound Message in messages_v2
    await env.DB.prepare(`
        INSERT INTO messages_v2 (
            customer_id, whatsapp_message_id, direction, sender_type, 
            message_type, message_text, button_id, status
        ) VALUES (?, ?, 'INBOUND', 'CUSTOMER', ?, ?, ?, 'READ')
    `).bind(customer.id, waMsgId, messageType, rawText, buttonId).run();

    // 3. GLOBAL COMMAND ENGINE (Exact matches only - No AI / NLP)
    const upperCmd = rawText.toUpperCase();

    if (upperCmd === 'UNSUBSCRIBE') {
        await env.DB.prepare(`UPDATE customers SET marketing_opt_in = 0 WHERE id = ?`).bind(customer.id).run();
        await sendTextMessage(env, customer.id, customer.phone, "You have been unsubscribed from promotional messages.\n\n[ MENU - Main Menu ]");
        return new Response('OK', { status: 200 });
    }

    if (upperCmd === 'STOP') {
        await sendTextMessage(env, customer.id, customer.phone, "Current session paused.\n\nType MENU to view options.");
        return new Response('OK', { status: 200 });
    }

    if (upperCmd === 'CANCEL') {
        // Check if pending order request exists
        const pendingOrder = await env.DB.prepare(`
            SELECT id FROM orders WHERE customer_id = ? AND status = 'PENDING_CONFIRMATION'
        `).bind(customer.id).first();

        if (pendingOrder) {
            await env.DB.prepare(`
                UPDATE orders 
                SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = 'Customer CANCEL command' 
                WHERE id = ?
            `).bind(pendingOrder.id).run();
            await sendTextMessage(env, customer.id, customer.phone, "Your active order request has been cancelled.");
        } else {
            await sendTextMessage(env, customer.id, customer.phone, "There is no active order request to cancel.");
        }
        return new Response('OK', { status: 200 });
    }

    if (upperCmd === 'MENU' || buttonId === 'MAIN_MENU') {
        await sendMainMenu(env, customer.id, customer.phone);
        return new Response('OK', { status: 200 });
    }

    if (upperCmd === 'HELP' || buttonId === 'HELP') {
        const helpText = "Available options:\n\nMENU — Main menu\nHELP — Show help\nLANGUAGE — Change language\nCANCEL — Cancel current order request\nSTOP — Stop current flow\nUNSUBSCRIBE — Stop promotional messages";
        await sendTextMessage(env, customer.id, customer.phone, helpText);
        return new Response('OK', { status: 200 });
    }

    if (upperCmd === 'LANGUAGE' || upperCmd === 'LANG' || buttonId === 'LANGUAGE') {
        await sendLanguageMenu(env, customer.id, customer.phone);
        return new Response('OK', { status: 200 });
    }

    // Default Fallback Response for Unsupported / Random Text
    await sendTextMessage(env, customer.id, customer.phone, "Please select an option below or type MENU.\n\n[ MENU - Main Menu ]");
    return new Response('OK', { status: 200 });
}

// Helper: Process Cart Submissions
async function handleCartSubmission(customer, message, env) {
    const cartItems = message.order?.product_items || [];
    
    // Create Order Request in PENDING_CONFIRMATION status
    const orderResult = await env.DB.prepare(`
        INSERT INTO orders (customer_id, phone, status, created_at)
        VALUES (?, ?, 'PENDING_CONFIRMATION', CURRENT_TIMESTAMP)
        RETURNING id
    `).bind(customer.id, customer.phone).first();

    for (const item of cartItems) {
        await env.DB.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `).bind(orderResult.id, item.product_retailer_id, item.quantity, item.item_price).run();
    }

    // Acknowledge receipt without confirming sale
    const ackMessage = "Thank you. Your order request has been received.\n\nOur team will contact you by phone or discuss it with you personally for final confirmation.";
    await sendTextMessage(env, customer.id, customer.phone, ackMessage);

    return new Response('OK', { status: 200 });
}

// Interactive Helper: Send Main Menu
async function sendMainMenu(env, customerId, recipientPhone) {
    const payload = {
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: "Welcome!\n\nPlease select an option:" },
            action: {
                buttons: [
                    { type: "reply", reply: { id: "HELP", title: "Help" } },
                    { type: "reply", reply: { id: "LANGUAGE", title: "Language" } }
                ]
            }
        }
    };
    await sendWhatsAppPayload(env, customerId, payload, "MAIN_MENU");
}

// Interactive Helper: Send Language Menu
async function sendLanguageMenu(env, customerId, recipientPhone) {
    const payload = {
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: "Please select your preferred language:" },
            action: {
                buttons: [
                    { type: "reply", reply: { id: "LANG_EN", title: "English" } },
                    { type: "reply", reply: { id: "LANG_HI", title: "हिन्दी" } }
                ]
            }
        }
    };
    await sendWhatsAppPayload(env, customerId, payload, "LANGUAGE");
}

// Outbound Text Helper
async function sendTextMessage(env, customerId, recipientPhone, text) {
    const payload = {
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "text",
        text: { body: text }
    };
    await sendWhatsAppPayload(env, customerId, payload, null, text);
}

// Shared Outbound WhatsApp API Invoker & DB Logger
async function sendWhatsAppPayload(env, customerId, payload, buttonId = null, text = null) {
    const url = `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    const waMsgId = data.messages?.[0]?.id || null;

    // Record Outbound System Message in messages_v2
    await env.DB.prepare(`
        INSERT INTO messages_v2 (
            customer_id, whatsapp_message_id, direction, sender_type, 
            message_type, message_text, button_id, status
        ) VALUES (?, ?, 'OUTBOUND', 'SYSTEM', ?, ?, ?, ?)
    `).bind(
        customerId, 
        waMsgId, 
        payload.type.toUpperCase(), 
        text || payload.interactive?.body?.text || '', 
        buttonId, 
        res.ok ? 'SENT' : 'FAILED'
    ).run();
}
