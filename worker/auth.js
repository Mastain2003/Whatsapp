// auth.js


// Create token
export async function createToken(env) {

    const timestamp = Date.now();

    const data = timestamp + ":" + env.AUTH_SECRET;


    const encoder = new TextEncoder();

    const hash =
    await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(data)
    );


    return Array.from(
        new Uint8Array(hash)
    )
    .map(
        b => b.toString(16).padStart(2,"0")
    )
    .join("");

}



// Login
export async function handleLogin(request, env) {


    const body =
    await request.json();


    if(
        body.password !== env.ADMIN_PASSWORD
    ){

        return Response.json(
            {
                success:false,
                message:"Invalid password"
            },
            {
                status:401
            }
        );

    }


    const token =
    await createToken(env);



    return Response.json(
        {
            success:true,
            token:token
        }
    );

}



// Verify token
export async function verifyToken(token, env){

    if(!token){
        return false;
    }


    // simple token validation
    const expected =
    await createToken(env);


    return token === expected;

}



// Get token from request
export function getToken(request){

    const header =
    request.headers.get(
        "Authorization"
    );


    if(!header){
        return null;
    }


    return header.replace(
        "Bearer ",
        ""
    );

}



// Authentication helper
export async function checkAuth(request, env){

    const token =
    getToken(request);


    return await verifyToken(
        token,
        env
    );

}
