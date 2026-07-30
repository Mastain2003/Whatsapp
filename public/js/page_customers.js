// public/js/page_customers.js
import {
    apiFetch,
    requireLogin,
    logout,
    showMessage
} from "./core.js";
import { loadSidebar } from "./sidebar.js";

requireLogin();
loadSidebar("customers");

const API_URL =
"https://whatsapp-api.prakharmastain9.workers.dev";


const token =
localStorage.getItem("token");



const table =
document.getElementById(
    "customerTable"
);





async function loadCustomers(){


    const name =document.getElementById("searchName").value.trim();
    const designation = document.getElementById("filterDesignation").value.trim();
    const department =  document.getElementById("filterDepartment").value.trim();
    const city =document.getElementById("filterCity").value.trim();
    const block =document.getElementById("filterBlock").value.trim();

    let url = API_URL + "/customers?";
    
    if(name){
        url +=  "name=" + encodeURIComponent(name) + "&";
    }

    if(designation){
        url +=  "Designation=" + encodeURIComponent(designation) + "&";
    }
    
    if(department){
        url +=  "department=" + encodeURIComponent(department) + "&";
    }

    if(city){
        url +=  "city=" + encodeURIComponent(city) + "&";
    }

    if(block){
        url +=  "block=" + encodeURIComponent(block);
    }





    const response =  await fetch(
        url,
        {
            headers:{
                "Authorization": "Bearer " + token
            }
        }
    );

    const data =    await response.json();

    table.innerHTML = "";

    if(!data.customers || data.customers.length === 0){
        table.innerHTML =
            `
        <tr>
            <td colspan="7">
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
                ${customer.customer_code || ""}
                </td>


                <td>
                ${customer.name || ""}
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
                ${customer.block || ""}
                </td>


                <td>
                ${customer.phone || ""}
                </td>


            </tr>
            `;


        }

    );


}





document.getElementById("btnSearch").onclick =loadCustomers;







// Excel Import


document.getElementById("btnImport").onclick =async function(){
    console.log("importing customers from excel sheet...");


    const fileInput =
    document.getElementById(
        "excelFile"
    );



    const file =
    fileInput.files[0];




    if(!file){

        alert(
            "Please select Excel file"
        );

        return;

    }






    const buffer =
    await file.arrayBuffer();




    const workbook =
    XLSX.read(

        buffer,

        {
            type:"array"
        }

    );





    const sheet =
    workbook.Sheets[
        workbook.SheetNames[0]
    ];






    const rows =
    XLSX.utils.sheet_to_json(

        sheet,

        {
            header:1
        }

    );
//console.log(rows);
//alert("Rows in sheet: " + rows.length);
 




    const customers = [];



console.log("reading customers...");

    for(

        let i=1;

        i<rows.length;

        i++

    ){



        const row =
        rows[i];



        if(

            !row ||

            row.length < 6

        ){

            continue;

        }





        const customer = {


            name:
            String(
                row[0] || ""
            )
            .trim(),



            designation:
            String(
                row[1] || ""
            )
            .trim(),



            department:
            String(
                row[2] || ""
            )
            .trim(),



            city:
            String(
                row[3] || ""
            )
            .trim(),

            block:
            String(
                row[4] || ""
            )
            .trim(),



            phone:
            String(
                row[5] || ""
            )
            .trim()


        };




        if(

            customer.name &&

            customer.phone

        ){

            customers.push(
                customer
            );

        }



    }
    //console.log(customers);
alert("Customers parsed: " + customers.length);






    if(
        customers.length === 0
    ){

        alert(
            "No valid customer rows found"
        );

        return;

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
  //  alert(JSON.stringify(result, null, 2));






    document
    .getElementById(
        "importResult"
    )
    .innerHTML =

    `
    Importeds:
    ${result.imported || 0}

    <br>

    Skippeds:
    ${result.skipped || 0}
    `;



};






// Initial load

loadCustomers();
