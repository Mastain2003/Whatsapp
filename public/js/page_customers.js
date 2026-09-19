// public/js/page_customers.js
/*import {
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


// public/js/page_customers.js

import {
    apiFetch,
    requireLogin,
    showMessage
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";

requireLogin();

loadSidebar(
    "customers"
);

const table =
document.getElementById(
    "customerTable"
);





async function loadCustomers(){

    try{

        const name =
        document
        .getElementById(
            "searchName"
        )
        .value
        .trim();


        const designation =
        document
        .getElementById(
            "filterDesignation"
        )
        .value
        .trim();


        const department =
        document
        .getElementById(
            "filterDepartment"
        )
        .value
        .trim();


        const city =
        document
        .getElementById(
            "filterCity"
        )
        .value
        .trim();


        const block =
        document
        .getElementById(
            "filterBlock"
        )
        .value
        .trim();



        const params =
        new URLSearchParams();



        if(name){

            params.set(
                "name",
                name
            );

        }



        if(designation){

            params.set(
                "designation",
                designation
            );

        }



        if(department){

            params.set(
                "department",
                department
            );

        }



        if(city){

            params.set(
                "city",
                city
            );

        }



        if(block){

            params.set(
                "block",
                block
            );

        }



        const query =

            params.toString()

            ?

            "/customers?" +
            params.toString()

            :

            "/customers";



        const data =
        await apiFetch(
            query
        );



        if(!data){

            return;

        }



        table.innerHTML = "";



        if(

            !data.customers ||

            data.customers.length === 0

        ){

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



        let html = "";



        data.customers.forEach(

            customer=>{

                html +=

                `
                <tr>

                    <td>

                        ${customer.id || ""}

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



        table.innerHTML =
        html;

    }

    catch(error){

        console.error(
            error
        );

        showMessage(

            "importResult",

            "Unable to load customers",

            "red"

        );

    }

}


const inputs = document.getElementsByClassName("filter");

for (const input of inputs) {
    input.addEventListener("keyup", (event) => {
        
           loadCustomers();
      //  }
    });
}*/


/*document
.getElementById(
    "btnSearch"
)
.onclick =
loadCustomers;*/

// Excel Import

/*document
.getElementById(
    "btnImport"
)
.onclick =
async function(){

    try{

        const fileInput =
        document.getElementById(
            "excelFile"
        );

        const file =
        fileInput.files[0];

        if(!file){

            showMessage(
                "importResult",
                "Please select Excel file",
                "red"
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

        const customers = [];

        for(

            let i = 1;

            i < rows.length;

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
                ).trim(),

                designation:
                String(
                    row[1] || ""
                ).trim(),

                department:
                String(
                    row[2] || ""
                ).trim(),

                city:
                String(
                    row[3] || ""
                ).trim(),

                block:
                String(
                    row[4] || ""
                ).trim(),

                phone:
                String(
                    row[5] || ""
                ).trim()

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

        if(

            customers.length === 0

        ){

            showMessage(

                "importResult",

                "No valid customer rows found",

                "red"

            );

            return;

        }
        console.log(JSON.stringify(customers) );
        const result =
        await apiFetch(

            "/customers/import",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:
                JSON.stringify(
                    customers
                )

            }

        );

        if(!result){

            return;

        }

        showMessage(

            "importResult",

            `Imported: ${result.imported || 0}
             | Skipped: ${result.skipped || 0}`,

            "green"

        );

        loadCustomers();

    }

    catch(error){

        console.error(
            error
        );

        showMessage(

            "importResult",

            "Import failed",

            "red"

        );

    }

};



// Initial Load

loadCustomers();*/

// public/js/page_customers.js

import {
    apiFetch,
    requireLogin,
    showMessage
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";


requireLogin();

loadSidebar(
    "customers"
);


const table =
document.getElementById(
    "customerTable"
);


/* =========================
   LOAD CUSTOMERS
========================= */

async function loadCustomers(){

    try{

        const name =
        document
        .getElementById("searchName")
        .value
        .trim();


        const designation =
        document
        .getElementById("filterDesignation")
        .value
        .trim();


        const department =
        document
        .getElementById("filterDepartment")
        .value
        .trim();


        const city =
        document
        .getElementById("filterCity")
        .value
        .trim();


        const block =
        document
        .getElementById("filterBlock")
        .value
        .trim();


        const params =
        new URLSearchParams();


        if(name){

            params.set(
                "name",
                name
            );

        }


        if(designation){

            params.set(
                "designation",
                designation
            );

        }


        if(department){

            params.set(
                "department",
                department
            );

        }


        if(city){

            params.set(
                "city",
                city
            );

        }


        if(block){

            params.set(
                "block",
                block
            );

        }


        const query =
        params.toString()
        ?
        "/customers?" +
        params.toString()
        :
        "/customers";


        const data =
        await apiFetch(query);


        if(!data){

            return;

        }


        table.innerHTML = "";


        if(
            !data.customers ||
            data.customers.length === 0
        ){

            table.innerHTML =

            `
            <tr>

                <td colspan="8">
                    Nothing to display
                </td>

            </tr>
            `;

            return;

        }


        let html = "";


        data.customers.forEach(
            customer => {

                html +=

                `
                <tr>

                    <td>
                        ${customer.id || ""}
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

                    <td>

                        <div class="action-buttons">

                            <button
                                class="btn-edit"
                                data-id="${customer.id}">
                                Edit
                            </button>

                            <button
                                class="btn-delete"
                                data-id="${customer.id}">
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
                `;

            }
        );


        table.innerHTML = html;


        /*
         * Add Edit button events
         */

        document
        .querySelectorAll(".btn-edit")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                    button.dataset.id;

                    editCustomer(id);

                }
            );

        });


        /*
         * Add Delete button events
         */

        document
        .querySelectorAll(".btn-delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                    button.dataset.id;

                    deleteCustomer(id);

                }
            );

        });

    }

    catch(error){

        console.error(error);

        showMessage(
            "importResult",
            "Unable to load customers",
            "red"
        );

    }

}


/* =========================
   FILTER SEARCH
========================= */

const inputs =
document.getElementsByClassName(
    "filter"
);


for(
    const input of inputs
){

    input.addEventListener(
        "keyup",
        () => {

            loadCustomers();

        }
    );

}


/* =========================
   ADD CUSTOMER
========================= */

document
.getElementById("btnAddCustomer")
.addEventListener(
    "click",
    () => {

        openCustomerForm();

    }
);


/* =========================
   OPEN FORM
========================= */

function openCustomerForm(
    customer = null
){

    const form =
    document.getElementById(
        "customerFormBox"
    );


    form.style.display =
    "block";


    if(customer){

        document
        .getElementById(
            "customerFormTitle"
        )
        .textContent =
        "Edit Customer";


        document
        .getElementById(
            "customerId"
        )
        .value =
        customer.id || "";


        document
        .getElementById(
            "customerName"
        )
        .value =
        customer.name || "";


        document
        .getElementById(
            "customerDesignation"
        )
        .value =
        customer.designation || "";


        document
        .getElementById(
            "customerDepartment"
        )
        .value =
        customer.department || "";


        document
        .getElementById(
            "customerCity"
        )
        .value =
        customer.city || "";


        document
        .getElementById(
            "customerBlock"
        )
        .value =
        customer.block || "";


        document
        .getElementById(
            "customerPhone"
        )
        .value =
        customer.phone || "";

    }
    else{

        document
        .getElementById(
            "customerFormTitle"
        )
        .textContent =
        "Add Customer";


        document
        .getElementById(
            "customerId"
        )
        .value = "";


        document
        .getElementById(
            "customerName"
        )
        .value = "";


        document
        .getElementById(
            "customerDesignation"
        )
        .value = "";


        document
        .getElementById(
            "customerDepartment"
        )
        .value = "";


        document
        .getElementById(
            "customerCity"
        )
        .value = "";


        document
        .getElementById(
            "customerBlock"
        )
        .value = "";


        document
        .getElementById(
            "customerPhone"
        )
        .value = "";

    }


    form
    .scrollIntoView({
        behavior:"smooth"
    });

}


/* =========================
   CANCEL FORM
========================= */

document
.getElementById(
    "btnCancelCustomer"
)
.addEventListener(
    "click",
    () => {

        document
        .getElementById(
            "customerFormBox"
        )
        .style.display =
        "none";

    }
);


/* =========================
   SAVE CUSTOMER
========================= */

document
.getElementById(
    "btnSaveCustomer"
)
.addEventListener(
    "click",
    saveCustomer
);


async function saveCustomer(){

    try{

        const id =
        document
        .getElementById(
            "customerId"
        )
        .value
        .trim();


        const name =
        document
        .getElementById(
            "customerName"
        )
        .value
        .trim();


        const designation =
        document
        .getElementById(
            "customerDesignation"
        )
        .value
        .trim();


        const department =
        document
        .getElementById(
            "customerDepartment"
        )
        .value
        .trim();


        const city =
        document
        .getElementById(
            "customerCity"
        )
        .value
        .trim();


        const block =
        document
        .getElementById(
            "customerBlock"
        )
        .value
        .trim();


        const phone =
        document
        .getElementById(
            "customerPhone"
        )
        .value
        .trim();


        if(!name){

            showMessage(
                "customerFormResult",
                "Name is required",
                "red"
            );

            return;

        }


        if(!phone){

            showMessage(
                "customerFormResult",
                "Phone number is required",
                "red"
            );

            return;

        }


        const customer = {

            name,
            designation,
            department,
            city,
            block,
            phone

        };


        let result;


        /*
         * EDIT
         */

        if(id){

            result =
            await apiFetch(
                "/customers/" + id,
                {

                    method:"PUT",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(
                        customer
                    )

                }
            );

        }

        /*
         * ADD
         */

        else{

            result =
            await apiFetch(
                "/customers",
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(
                        customer
                    )

                }
            );

        }


        if(!result){

            return;

        }


        showMessage(

            "customerFormResult",

            id
            ?
            "Customer updated successfully"
            :
            "Customer added successfully",

            "green"

        );


        setTimeout(
            () => {

                document
                .getElementById(
                    "customerFormBox"
                )
                .style.display =
                "none";


                loadCustomers();

            },
            500
        );

    }

    catch(error){

        console.error(error);

        showMessage(
            "customerFormResult",
            "Unable to save customer",
            "red"
        );

    }

}


/* =========================
   EDIT CUSTOMER
========================= */

async function editCustomer(id){

    try{

        const data =
        await apiFetch(
            "/customers/" + id
        );


        if(!data){

            return;

        }


        /*
         * Backend may return:
         *
         * { customer: {...} }
         *
         */

        const customer =
        data.customer;


        if(!customer){

            showMessage(
                "importResult",
                "Customer not found",
                "red"
            );

            return;

        }


        openCustomerForm(
            customer
        );

    }

    catch(error){

        console.error(error);

        showMessage(
            "importResult",
            "Unable to load customer",
            "red"
        );

    }

}


/* =========================
   DELETE CUSTOMER
========================= */

async function deleteCustomer(id){

    const confirmed =
    confirm(
        "Are you sure you want to delete this customer?"
    );


    if(!confirmed){

        return;

    }


    try{

        const result =
        await apiFetch(
            "/customers/" + id,
            {
                method:"DELETE"
            }
        );


        if(!result){

            return;

        }


        showMessage(
            "importResult",
            "Customer deleted successfully",
            "green"
        );


        loadCustomers();

    }

    catch(error){

        console.error(error);

        showMessage(
            "importResult",
            "Unable to delete customer",
            "red"
        );

    }

}


/* =========================
   EXCEL IMPORT
========================= */

document
.getElementById(
    "btnImport"
)
.onclick =
async function(){

    try{

        const fileInput =
        document.getElementById(
            "excelFile"
        );


        const file =
        fileInput.files[0];


        if(!file){

            showMessage(
                "importResult",
                "Please select Excel file",
                "red"
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


        const customers = [];


        for(
            let i = 1;
            i < rows.length;
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
                ).trim(),

                designation:
                String(
                    row[1] || ""
                ).trim(),

                department:
                String(
                    row[2] || ""
                ).trim(),

                city:
                String(
                    row[3] || ""
                ).trim(),

                block:
                String(
                    row[4] || ""
                ).trim(),

                phone:
                String(
                    row[5] || ""
                ).trim()

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


        if(
            customers.length === 0
        ){

            showMessage(
                "importResult",
                "No valid customer rows found",
                "red"
            );

            return;

        }


        const result =
        await apiFetch(

            "/customers/import",

            {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify(
                    customers
                )

            }

        );


        if(!result){

            return;

        }


        showMessage(

            "importResult",

            `Imported: ${result.imported || 0}
             | Skipped: ${result.skipped || 0}`,

            "green"

        );


        loadCustomers();

    }

    catch(error){

        console.error(error);

        showMessage(
            "importResult",
            "Import failed",
            "red"
        );

    }

};


/* =========================
   INITIAL LOAD
========================= */

loadCustomers();
