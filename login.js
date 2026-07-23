const API_URL =
"https://whatsapp-api.prakharmastain9.workers.dev";


// If already logged in, go directly to dashboard
const token = localStorage.getItem("token");

if (token) {
    window.location.href = "index.html";
}


// Login function
async function login() {

    const username =
    document.getElementById("username").value;


    const password =
    document.getElementById("password").value;


    try {

        const response =
        await fetch(
            API_URL + "/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        const data =
        await response.json();



        if (data.success) {


            localStorage.setItem(
                "token",
                data.token
            );


            window.location.href =
            "index.html";


        }
        else {

            alert(
                data.message || "Login failed"
            );

        }


    }
    catch(error) {

        console.error(
            "Login error:",
            error
        );

        alert(
            "Server connection failed"
        );

    }

}
