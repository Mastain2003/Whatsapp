import { jsonResponse } from "./cors_helper.js";

export async function handleWhatsAppDashboard(
    request,
    env
){
    // Count total sent messages from messages_v2
    const sent = await env.DB
        .prepare(
            `
            SELECT COUNT(*) as count
            FROM messages_v2
            WHERE direction = 'OUTBOUND'
            `
        )
        .first();

    // Count delivered messages
    const delivered = await env.DB
        .prepare(
            `
            SELECT COUNT(*) as count
            FROM messages_v2
            WHERE status = 'DELIVERED' OR delivered_at IS NOT NULL
            `
        )
        .first();

    // Count read messages
    const read = await env.DB
        .prepare(
            `
            SELECT COUNT(*) as count
            FROM messages_v2
            WHERE status = 'READ' OR read_at IS NOT NULL
            `
        )
        .first();

    // Count active 24-hour customer service sessions
    const sessions = await env.DB
        .prepare(
            `
            SELECT COUNT(*) as count
            FROM whatsapp_sessions
            WHERE window_active = 1
            `
        )
        .first();

    return jsonResponse({
        success: true,
        data: {
            sent: sent ? sent.count : 0,
            delivered: delivered ? delivered.count : 0,
            read: read ? read.count : 0,
            sessions: sessions ? sessions.count : 0
        }
    });
}
