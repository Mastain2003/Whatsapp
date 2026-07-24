// public/js/page_customers.js


const API_URL =
"https://whatsapp-api.prakharmastain9.workers.dev";



const token =
localStorage.getItem("token");





const table =
document.getElementById(
    "customerTable"
);





async function loadCustomers(){


    const name =
    document.getElementById(
        "searchName"
    ).value;


    const city =
    document.getElementById(
        "filterCity"
    ).value;


    const department =
    document.getElementById(
        "filterDepartment"
    ).value;



    let url =
    API_URL + "/customers?";



    if(name){

        url +=
        "name=" +
        encodeURIComponent(name)
        +
        "&";

    }


    if(city){

        url +=
        "city=" +
        encodeURIComponent(city)
        +
        "&";

    }



    if(department){

        url +=
        "department=" +
        encodeURIComponent(department);

    }





    const response =
    await fetch(
        url,
        {

            headers:{

                "Authorization":
                "Bearer " + token

            }

        }
    );



    const data =
    await response.json();




    table.innerHTML = "";




    if(
        !data.customers ||
        data.customers.length === 0
    ){

        table.innerHTML =
        `
        <tr>
            <td colspan="6">
                Nothing to display
            </td>
        </tr>
        `;

        return;

    }






    data.customers.forEach(
        customer => {


        table.innerHTML +=
        `
        <tr>

            <td>
            ${customer.customer_code}
            </td>


            <td>
            ${customer.name}
            </td>


            <td>
            ${customer.designation || ""}
            </td>


            <td>
            ${customer.department || ""}
            </td>


            <td>
            ${customer.city || ""}
            </td>


            <td>
            ${customer.phone || ""}
            </td>


        </tr>
        `;


        }
    );


}





document
.getElementById(
    "btnSearch"
)
.onclick =
loadCustomers;





loadCustomers();
