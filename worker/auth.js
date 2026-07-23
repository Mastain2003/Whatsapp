// auth.js


// Create random token
export function createToken() {

    const bytes = new Uint8Array(32);

    crypto.getRandomValues(bytes);

    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

}



// Login
export async function handleLogin(request, env) {

    const body = await request.json();


    const username = body.username;
    const password = body.password;


    // Temporary admin credentials
    // Change these later to environment variables
    if (
        username !== "admin" ||
        password !== "admin"
    ) {

        return Response.json(
            {
                success:false,
                message:"Invalid username or password"
            },
            {
                status:401
            }
        );

    }



    const token = createToken();


    // Save token in KV
    await env.AUTH_KV.put(
        token,
        username,
        {
            expirationTtl: 86400
        }
    );


    return Response.json(
        {
            success:true,
            token:token
        }
    );

}




// Verify token
export async function verifyToken(token, env) {


    if(!token){
        return false;
    }


    const user =
    await env.AUTH_KV.get(token);


    return user !== null;

}




// Get token from request header
export function getToken(request){

    const auth =
    request.headers.get("Authorization");


    if(!auth){
        return null;
    }


    return auth.replace(
        "Bearer ",
        ""
    );

}




// Check API authentication
export async function checkAuth(request, env){

    const token =
    getToken(request);


    return await verifyToken(
        token,
        env
    );

}
