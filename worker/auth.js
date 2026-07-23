// auth.js


// Create random token
export function createToken() {

    const array = new Uint8Array(32);

    crypto.getRandomValues(array);

    return Array.from(array)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

}



// Login handler
export async function handleLogin(request, env) {


    const body =
    await request.json();


    const username =
    body.username;


    const password =
    body.password;



    // Check admin credentials
    const user =
    await env.DB
    .prepare(
        "SELECT * FROM users WHERE username=? AND password=?"
    )
    .bind(
        username,
        password
    )
    .first();



    if(!user){

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



    const token =
    createToken();



    // Save token
    await env.DB
    .prepare(
        `
        INSERT INTO sessions
        (
            token,
            user_id,
            created_at
        )
        VALUES
        (
            ?,
            ?,
            CURRENT_TIMESTAMP
        )
        `
    )
    .bind(
        token,
        user.id
    )
    .run();



    return Response.json({

        success:true,

        token:token

    });


}





// Verify token for all APIs
export async function verifyToken(token, env) {


    if(!token){

        return false;

    }



    const session =
    await env.DB
    .prepare(
        `
        SELECT *
        FROM sessions
        WHERE token=?
        `
    )
    .bind(token)
    .first();



    return !!session;


}





// Get token from request
export function getToken(request){


    const auth =
    request.headers.get(
        "Authorization"
    );


    if(!auth){

        return null;

    }


    return auth.replace(
        "Bearer ",
        ""
    );


}





// Middleware helper
export async function checkAuth(request, env){


    const token =
    getToken(request);


    const valid =
    await verifyToken(
        token,
        env
    );


    return valid;


}
