const API_URL =
"https://whatsapp-api.prakharmastain9.workers.dev";


async function login(){

let response =
await fetch(API_URL+"/login",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:
document.getElementById("username").value,

password:
document.getElementById("password").value

})

});


let data =
await response.json();


if(data.success){

localStorage.setItem(
"token",
data.token
);


location.href="index.html";

}
else{

alert(data.message);

}

}
