export async function checkAuth(
    request,
    env
){

    const auth =
    request.headers.get("Authorization");


    if(!auth){
        return false;
    }


    const token =
    auth.replace("Bearer ","");


    try{

        const parts =
        token.split(".");


        if(parts.length !== 3){
            return false;
        }


        const payload =
        JSON.parse(
            atob(parts[1])
        );


        if(payload.exp < Date.now()){
            return false;
        }


        return true;


    }
    catch(e){

        return false;

    }

}
