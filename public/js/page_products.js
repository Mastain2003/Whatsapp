import {
    apiFetch,
    requireLogin,
    logout,
    showMessage
} from "./core.js";



requireLogin();



const list =
document.getElementById(
    "productList"
);


const saveBtn =
document.getElementById(
    "saveProduct"
);


const searchBtn =
document.getElementById(
    "searchBtn"
);


const logoutBtn =
document.getElementById(
    "logoutBtn"
);





logoutBtn.onclick =
logout;






async function loadProducts(
    search = ""
){

    let url =
    "/products";


    if(search){

        url +=
        "?name=" +
        encodeURIComponent(search);

    }



    const data =
    await apiFetch(url);



    if(
        !data ||
        !data.success
    ){

        return;

    }



    list.innerHTML = "";



    data.products.forEach(
    product => {


        const row =
        document.createElement(
            "tr"
        );


        row.innerHTML = `

        <td>
        ${product.product_code}
        </td>

        <td>
        ${product.name}
        </td>

        <td>
        ${product.category || ""}
        </td>

        <td>
        ${product.brand || ""}
        </td>

        <td>
        ${product.unit || ""}
        </td>

        <td>
        ₹${product.price}
        </td>

        <td>

        <button
        class="action-btn"
        onclick="deleteProduct(${product.id})">

        Delete

        </button>

        </td>

        `;


        list.appendChild(row);


    });


}







saveBtn.onclick =
async function(){


    const body = {


        name:
        document.getElementById(
            "name"
        ).value,


        category:
        document.getElementById(
            "category"
        ).value,


        brand:
        document.getElementById(
            "brand"
        ).value,


        unit:
        document.getElementById(
            "unit"
        ).value,


        price:
        Number(
        document.getElementById(
            "price"
        ).value
        ),


        description:
        document.getElementById(
            "description"
        ).value


    };



    const result =
    await apiFetch(
        "/products",
        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },


            body:
            JSON.stringify(body)

        }
    );



    if(
        result &&
        result.success
    ){

        showMessage(
            "message",
            "Product saved"
        );


        loadProducts();


    }

};







searchBtn.onclick =
function(){

    const value =
    document.getElementById(
        "search"
    ).value;


    loadProducts(value);

};








window.deleteProduct =
async function(id){


    if(
        !confirm(
        "Delete product?"
        )
    ){

        return;

    }



    const result =
    await apiFetch(
        "/products",
        {

            method:"DELETE",

            headers:{
                "Content-Type":
                "application/json"
            },


            body:
            JSON.stringify({
                id
            })

        }
    );



    if(
        result &&
        result.success
    ){

        loadProducts();

    }


};







loadProducts();
