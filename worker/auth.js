async function createToken(username, secret) {

    const header = btoa(JSON.stringify({
        alg: "HS256",
        typ: "JWT"
    }));

    const payload = btoa(JSON.stringify({
        username: username,
        exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
    }));

    const data = header + "." + payload;


    const encoder = new TextEncoder();


    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
            name:"HMAC",
            hash:"SHA-256"
        },
        false,
        ["sign"]
    );


    const signature =
        await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(data)
        );


    const sig = btoa(
        String.fromCharCode(
            ...new Uint8Array(signature)
        )
    );


    return data + "." + sig;

}



export async function handleLogin(
    request,
    env,
    corsHeaders
){

    if(request.method !== "POST"){

        return Response.json(
            {
                success:false,
                message:"Method not allowed"
            },
            {
                status:405,
                headers:corsHeaders
            }
        );

    }


    const body =
    await request.json();



    if(
        body.username !== "admin" ||
        body.password !== env.ADMIN_PASSWORD
    ){

        return Response.json(
            {
                success:false,
                message:"Invalid username or password"
            },
            {
                status:401,
                headers:corsHeaders
            }
        );

    }



    const token =
    await createToken(
        body.username,
        env.AUTH_SECRET
    );



    return Response.json(
        {
            success:true,
            token:token
        },
        {
            headers:corsHeaders
        }
    );

}
