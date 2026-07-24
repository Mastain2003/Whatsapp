import {
    apiFetch,
    requireLogin,
    logout,
    showMessage
} from "./core.js";

import { loadSidebar } from "./sidebar.js";


requireLogin();
loadSidebar("products");


const list =
document.getElementById("productList");

const saveBtn =
document.getElementById("saveProduct");

const searchBtn =
document.getElementById("searchBtn");





async function loadProducts(search = ""){

    let url = "/products";


    if(search){

        url +=
        "?name=" +
        encodeURIComponent(search);

    }


    const data =
    await apiFetch(url);


    if(!data || !data.success){

        return;

    }


    list.innerHTML = "";


    data.products.forEach(product => {


        const row =
        document.createElement("tr");


        row.innerHTML = `

        <td>${product.product_code}</td>

        <td>${product.name}</td>

        <td>${product.category || ""}</td>

        <td>${product.brand || ""}</td>

        <td>${product.unit || ""}</td>

        <td>₹${product.price}</td>


        <td>

        <button
        onclick="editProduct(${product.id})">
        Edit
        </button>


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
        document.getElementById("name").value,


        category:
        document.getElementById("category").value,


        brand:
        document.getElementById("brand").value,


        unit:
        document.getElementById("unit").value,


        price:
        Number(
            document.getElementById("price").value
        ),


        description:
        document.getElementById("description").value

    };



    const editId = saveBtn.dataset.editId;



    let method =
    "POST";



    if(editId){

        method = "PUT";

        body.id =
        Number(editId);

    }



    const result =
    await apiFetch(

        "/products",

        {

            method,


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
            editId
            ?
            "Product updated"
            :
            "Product saved"
        );


        saveBtn.innerText =
        "Save Product";


        delete saveBtn.dataset.editId;


        clearForm();


        loadProducts();

    }


};







function clearForm(){


    document.getElementById("name").value="";

    document.getElementById("category").value="";

    document.getElementById("brand").value="";

    document.getElementById("unit").value="";

    document.getElementById("price").value="";

    document.getElementById("description").value="";


}








searchBtn.onclick =
function(){

    const value =
    document.getElementById("search").value;


    loadProducts(value);

};








window.editProduct =
async function(id){


    const data =
    await apiFetch(
        "/products"
    );


    if(
        !data ||
        !data.success
    ){

        return;

    }



    const product =
    data.products.find(
        p => p.id === id
    );


    if(!product){

        return;

    }



    document.getElementById("name").value =
    product.name;


    document.getElementById("category").value =
    product.category || "";


    document.getElementById("brand").value =
    product.brand || "";


    document.getElementById("unit").value =
    product.unit || "";


    document.getElementById("price").value =
    product.price;


    document.getElementById("description").value =
    product.description || "";



    saveBtn.dataset.editId =
    product.id;


    saveBtn.innerText =
    "Update Product";


};









window.deleteProduct =
async function(id){


    if(
        !confirm("Delete product?")
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
