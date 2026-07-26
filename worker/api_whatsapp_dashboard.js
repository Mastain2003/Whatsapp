import { jsonResponse } from "./cors_helper.js";


export async function handleWhatsAppDashboard(
    request,
    env
){

    const sent =
    await env.DB
    .prepare(
    `
    SELECT COUNT(*) as count
    FROM whatsapp_messages
    `
    )
    .first();



    const delivered =
    await env.DB
    .prepare(
    `
    SELECT COUNT(*) as count
    FROM whatsapp_messages
    WHERE status='delivered'
    `
    )
    .first();



    const read =
    await env.DB
    .prepare(
    `
    SELECT COUNT(*) as count
    FROM whatsapp_messages
    WHERE status='read'
    `
    )
    .first();



    const sessions =
    await env.DB
    .prepare(
    `
    SELECT COUNT(*) as count
    FROM whatsapp_sessions
    WHERE window_active=1
    `
    )
    .first();



    return jsonResponse({

        success:true,

        data:{

            sent: sent.count,

            delivered: delivered.count,

            read: read.count,

            sessions: sessions.count

        }

    });

}
