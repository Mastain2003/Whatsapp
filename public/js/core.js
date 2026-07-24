// public/js/core.js


export const API_URL =
"https://whatsapp-api.prakharmastain9.workers.dev";





export function getToken(){

    return localStorage.getItem(
        "token"
    );

}






export function saveToken(
    token
){

    localStorage.setItem(
        "token",
        token
    );

}






export function removeToken(){

    localStorage.removeItem(
        "token"
    );

}







export function logout(){

    removeToken();

    window.location.href =
    "login.html";

}







export function isLoggedIn(){

    return !!getToken();

}







export function requireLogin(){

    if(
        !isLoggedIn()
    ){

        window.location.href =
        "login.html";

    }

}







export async function apiFetch(

    path,

    options = {}

){


    const token =
    getToken();




    const headers = {

        ...(options.headers || {}),

        Authorization:
        "Bearer " + token

    };





    const response =
    await fetch(

        API_URL + path,

        {

            ...options,

            headers

        }

    );





    if(
        response.status === 401
    ){

        logout();

        return null;

    }





    return response.json();

}








export function showMessage(

    elementId,

    message,

    color = "green"

){

    const el =
    document.getElementById(
        elementId
    );



    if(!el){

        return;

    }



    el.style.color =
    color;

    el.innerHTML =
    message;

}
