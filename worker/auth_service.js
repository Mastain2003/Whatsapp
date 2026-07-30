import { jsonResponse } from "./cors_helper.js";
import { generateToken } from "./utils_token.js";

const SESSION_HOURS = 24;



export async function handleLogin(
    request,
    env
){

    if(request.method !== "POST"){

        return jsonResponse({
            success:false,
            message:"Method not allowed"
        },405);

    }

    const body =
    await request.json();

    const user =
    await env.DB
    .prepare(
    `
    SELECT
        id,
        username,
        password,
        role,
        status
    FROM users
    WHERE username = ?
    `
    )
    .bind(body.username)
    .first();

    if(
        !user ||
        user.status !== 1 ||
        user.password !== body.password
    ){

        return jsonResponse({
            success:false,
            message:"Invalid username or password"
        },401);

    }


    const token =
    generateToken();


    const expires =
    new Date(
        Date.now() +
        SESSION_HOURS * 60 * 60 * 1000
    )
    .toISOString();


    const ip =
    request.headers.get(
        "CF-Connecting-IP"
    ) || "";


    const agent =
    request.headers.get(
        "User-Agent"
    ) || "";


    await env.DB
    .prepare(
    `
    INSERT INTO sessions
    (
        user_id,
        token,
        expires_at,
        ip_address,
        user_agent
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?
    )
    `
    )
    .bind(
        user.id,
        token,
        expires,
        ip,
        agent
    )
    .run();


    return jsonResponse({

        success:true,

        token,

        user:{
            id:user.id,
            username:user.username,
            role:user.role
        }

    });

}



export async function checkAuth(
    request,
    env
){
   // alert(request.path);
    const auth =
    request.headers.get(
        "Authorization"
    );

    if(
        !auth ||
        !auth.startsWith("Bearer ")
    ){

        return null;

    }

    const token =
    auth.substring(7);

    const session =
    await env.DB
    .prepare(
    `
    SELECT
        s.user_id,
        s.expires_at,
        u.username,
        u.role,
        u.status
    FROM sessions s
    JOIN users u
        ON u.id = s.user_id
    WHERE s.token = ?
    `
    )
    .bind(token)
    .first();

    if(!session){

        return null;

    }

    if(session.status !== 1){

        return null;

    }

    if(
        new Date(session.expires_at) <
        new Date()
    ){

        await env.DB
        .prepare(
        `
        DELETE FROM sessions
        WHERE token = ?
        `
        )
        .bind(token)
        .run();

        return null;

    }

    return session;

}



export async function logout(
    request,
    env
){

    const auth =
    request.headers.get(
        "Authorization"
    );

    if(
        !auth ||
        !auth.startsWith("Bearer ")
    ){

        return jsonResponse({
            success:true
        });

    }

    const token =
    auth.substring(7);

    await env.DB
    .prepare(
    `
    DELETE FROM sessions
    WHERE token = ?
    `
    )
    .bind(token)
    .run();

    return jsonResponse({
        success:true
    });

}
