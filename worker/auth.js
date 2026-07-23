// auth.js


// Create token
export async function createToken(env) {


    const timestamp =
    Date.now().toString();


    const data =
    timestamp + env.AUTH_SECRET;



    const encoder =
    new TextEncoder();



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





// Login API

export async function handleLogin(
    request,
    env
){


    const body =
    await request.json();



    const password =
    body.password;



    if(
        password !== env.ADMIN_PASSWORD
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





// Extract token

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





// Verify token

export async function verifyToken(
    token,
    env
){


    if(!token){

        return false;

    }



    const expected =
    await createToken(env);



    return (
        token === expected
    );


}





// Protect API routes

export async function checkAuth(
    request,
    env
){


    const token =
    getToken(request);



    return await verifyToken(
        token,
        env
    );


}
