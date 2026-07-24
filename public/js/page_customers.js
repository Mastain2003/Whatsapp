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


// Excel Import


document
.getElementById(
    "btnImport"
)
.onclick =
async function(){



    const fileInput =
    document.getElementById(
        "excelFile"
    );


    const file =
    fileInput.files[0];



    if(!file){

    alert("Select file first");

    return;

}


document.getElementById("importResult").innerHTML =
"Reading file: " + file.name;




    const text =
    await file.text();



    const rows =
    text
    .split("\n")
    .map(
        row =>
        row.split(",")
    );



    const customers = [];




    // Skip header row

    for(
        let i=1;
        i<rows.length;
        i++
    ){


        const row =
        rows[i];



        if(
            row.length < 5
        ){

            continue;

        }



        customers.push({

            name:
            row[0].trim(),


            designation:
            row[1].trim(),


            department:
            row[2].trim(),


            city:
            row[3].trim(),


            phone:
            row[4].trim()

        });



    }





    const response =
    await fetch(

        API_URL +
        "/customers/import",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json",


                "Authorization":
                "Bearer " + token

            },


            body:
            JSON.stringify(
                customers
            )

        }

    );





    const result =
    await response.json();





    document
    .getElementById(
        "importResult"
    )
    .innerHTML =

    `
    Imported:
    ${result.imported || 0}

    <br>

    Skipped:
    ${result.skipped || 0}
    `;



};
