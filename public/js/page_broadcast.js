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


const searchCustomer =
document.getElementById(
    "searchCustomer"
);


const cityFilter =
document.getElementById(
    "cityFilter"
);


const departmentFilter =
document.getElementById(
    "departmentFilter"
);


const selectedCount =
document.getElementById(
    "selectedCount"
);



let customers = [];

let filteredCustomers = [];





async function loadCustomers(){


    const response =
    await apiFetch(
        "/customers"
    );


    if(
        !response ||
        !response.success
    ){

        customerList.innerHTML =
        "Unable to load customers";

        return;

    }



    customers =
    response.customers;



    filteredCustomers =
    [...customers];



    createFilters();


    renderCustomers();

}






function createFilters(){


    const cities =
    [
        ...new Set(
            customers
            .map(
                c => c.city
            )
            .filter(Boolean)
        )
    ];



    cities.forEach(
        city => {


            cityFilter.innerHTML +=
            `
            <option value="${city}">
            ${city}
            </option>
            `;


        }
    );





    const departments =
    [
        ...new Set(
            customers
            .map(
                c => c.department
            )
            .filter(Boolean)
        )
    ];



    departments.forEach(
        department => {


            departmentFilter.innerHTML +=
            `
            <option value="${department}">
            ${department}
            </option>
            `;


        }
    );


}







function renderCustomers(){


    customerList.innerHTML =
    "";



    filteredCustomers.forEach(
        customer => {


            const div =
            document.createElement(
                "div"
            );


            div.className =
            "customer-item";



            div.innerHTML =

            `
            <input
            type="checkbox"
            class="customer-check"
            value="${customer.id}">


            <span>

            <div class="customer-name">
            ${customer.name}
            </div>


            <div class="customer-details">

            ${customer.phone || ""}

            ${customer.city || ""}

            ${customer.department || ""}

            </div>


            </span>

            `;



            customerList.appendChild(
                div
            );


        }
    );



    updateCount();

}








function applyFilter(){


    const search =
    searchCustomer
    .value
    .toLowerCase();



    const city =
    cityFilter.value;



    const department =
    departmentFilter.value;



    filteredCustomers =

    customers.filter(
        customer => {


            const matchesSearch =

            !search ||

            customer.name
            .toLowerCase()
            .includes(search)

            ||

            (customer.phone || "")
            .includes(search);



            const matchesCity =

            !city ||

            customer.city === city;



            const matchesDepartment =

            !department ||

            customer.department === department;



            return (

                matchesSearch &&

                matchesCity &&

                matchesDepartment

            );


        }
    );



    renderCustomers();

}







function updateCount(){


    const selected =

    document
    .querySelectorAll(
        ".customer-check:checked"
    )
    .length;



    selectedCount.innerHTML =

    `Selected: ${selected}`;

}








document
.addEventListener(
"change",
function(event){


    if(
        event.target.classList
        .contains(
            "customer-check"
        )
    ){

        updateCount();

    }


});







searchCustomer.addEventListener("input",applyFilter);



cityFilte.addEventListener("change",applyFilter);



departmentFilter.addEventListener("change",applyFilter);








document.getElementById(    "selectAll").onclick =function(){


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


    updateCount();


};







document
.getElementById(
    "clearAll"
)
.onclick =
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


    updateCount();


};








document
.getElementById(
    "sendBroadcast"
)
.onclick =
async function(){


    const selected =

    Array.from(

        document
        .querySelectorAll(
            ".customer-check:checked"
        )

    )
    .map(
        item =>
        item.value
    );



    const message =

    document
    .getElementById(
        "message"
    )
    .value;




    if(
        selected.length === 0
    ){

        document
        .getElementById(
            "result"
        )
        .innerHTML =
        "Select customers first";

        return;

    }



    if(
        !message.trim()
    ){

        document
        .getElementById(
            "result"
        )
        .innerHTML =
        "Enter message";

        return;

    }





    const response =

    await apiFetch(
        "/broadcast",
        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:

            JSON.stringify({

                customers:selected,

                message:message

            })

        }
    );



    document
    .getElementById(
        "result"
    )
    .innerHTML =

    response.message ||

    "Broadcast created";


};







loadCustomers();
