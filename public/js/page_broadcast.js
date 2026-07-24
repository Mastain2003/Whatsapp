import {
    apiFetch
} from "./core.js";


import {
    loadSidebar
} from "./sidebar.js";


loadSidebar("broadcast");



const customerList =
document.getElementById(
    "customerList"
);


const selectAllBtn =
document.getElementById(
    "selectAll"
);


const clearAllBtn =
document.getElementById(
    "clearAll"
);



let customers = [];






async function loadCustomers(){


    const data =
    await apiFetch(
        "/customers"
    );



    if(
        !data ||
        !data.success
    ){

        customerList.innerHTML =
        "Unable to load customers";

        return;

    }



    customers =
    data.customers;



    renderCustomers();

}







function renderCustomers(){


    customerList.innerHTML =
    "";



    customers.forEach(customer => {


        const div =
        document.createElement(
            "div"
        );


        div.className =
        "customer-item";



        div.innerHTML = `

        <input
        type="checkbox"
        class="customer-check"
        value="${customer.id}">


        <span>

        ${customer.name || ""}

        ${customer.phone || ""}

        </span>

        `;



        customerList.appendChild(
            div
        );


    });


}








selectAllBtn.onclick =
function(){


    document
    .querySelectorAll(
        ".customer-check"
    )
    .forEach(
        checkbox => {

            checkbox.checked =
            true;

        }
    );


};







clearAllBtn.onclick =
function(){


    document
    .querySelectorAll(
        ".customer-check"
    )
    .forEach(
        checkbox => {

            checkbox.checked =
            false;

        }
    );


};








document
.getElementById(
    "sendBroadcast"
)
.onclick =
function(){


    const selected =
    Array.from(

        document.querySelectorAll(
            ".customer-check:checked"
        )

    )
    .map(
        item =>
        item.value
    );



    const message =
    document.getElementById(
        "message"
    )
    .value;



    document
    .getElementById(
        "result"
    )
    .innerHTML =

    `
    Selected customers:
    ${selected.length}
    <br>
    Message length:
    ${message.length}
    `;


};







loadCustomers();
