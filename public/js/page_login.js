// public/js/page_login.js

const API_URL =
"https://whatsapp-api.prakharmastain9.workers.dev";



document
.getElementById("btnLogin")
.onclick =
async function(){


    const username =
    document
    .getElementById("username")
    .value
    .trim();


    const password =
    document
    .getElementById("password")
    .value;



    if(!username || !password){

        document
        .getElementById("loginMessage")
        .innerHTML =
        "Enter username and password";

        return;

    }



    try{

        const response =
        await fetch(

            API_URL + "/login",

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    username,
                    password

                })

            }

        );



        const result =
        await response.json();



        if(result.success){


            localStorage.setItem(

                "token",

                result.token

            );



            document
            .getElementById("loginMessage")
            .innerHTML =
            "Login successful...";



            setTimeout(()=>{

                window.location.href =
                "dashboard.html";

            },800);

        }
        else{

            document
            .getElementById("loginMessage")
            .innerHTML =
            result.message ||
            "Login failed";

        }


    }
    catch(error){

        document
        .getElementById("loginMessage")
        .innerHTML =
        "Unable to connect to server";

    }

};
