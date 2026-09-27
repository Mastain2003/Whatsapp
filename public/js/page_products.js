import {
    apiFetch,
    requireLogin
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";


requireLogin();

loadSidebar("products");


const list =
    document.getElementById("productList");

const searchInput =
    document.getElementById("search");

const searchBtn =
    document.getElementById("searchBtn");

const message =
    document.getElementById("message");


let products = [];



function escapeHtml(value){

    if(value === null || value === undefined){

        return "";

    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



function showMessage(text, type = ""){

    message.innerText = text;

    message.className = type;

}



function formatPrice(product){

    if(
        product.price === undefined ||
        product.price === null ||
        product.price === ""
    ){

        return "";

    }


    const price =
        Number(product.price);


    if(Number.isNaN(price)){

        return escapeHtml(product.price);

    }


    const currency =
        product.currency || "INR";


    try{

        return new Intl.NumberFormat(
            "en-IN",
            {
                style:"currency",
                currency
            }
        ).format(price);

    }
    catch{

        return `${currency} ${price}`;

    }

}



function renderProducts(items){

    list.innerHTML = "";


    if(!items.length){

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td
                colspan="6"
                class="empty-message">

                Nothing to display

            </td>
        `;

        list.appendChild(row);

        return;

    }


    items.forEach(product => {

        const row =
            document.createElement("tr");


        const imageUrl =
            product.image_url || "";


        const imageHtml =
            imageUrl

            ?

            `
            <img
                class="product-image"
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(product.name || "Product")}"
                loading="lazy"
            >
            `

            :

            `
            <div class="no-image">
                No image
            </div>
            `;


        row.innerHTML = `

            <td>

                ${imageHtml}

            </td>


            <td>

                <div class="product-id">

                    ${escapeHtml(
                        product.id || ""
                    )}

                </div>

            </td>


            <td>

                <div class="product-name">

                    ${escapeHtml(
                        product.name || ""
                    )}

                </div>

            </td>


            <td>

                <div class="product-description">

                    ${escapeHtml(
                        product.description || ""
                    )}

                </div>

            </td>


            <td>

                <div class="price">

                    ${formatPrice(product)}

                </div>

            </td>


            <td>

                <div class="availability">

                    ${escapeHtml(
                        product.availability || ""
                    )}

                </div>

            </td>

        `;


        list.appendChild(row);

    });

}



async function loadProducts(){

    showMessage(
        "Loading catalog products...",
        "loading-message"
    );


    list.innerHTML = "";


    try{

        const data =
            await apiFetch("/products");


        if(
            !data ||
            !data.success
        ){

            showMessage(
                data?.message ||
                "Unable to load catalog products.",
                "error-message"
            );

            return;

        }


        products =
            Array.isArray(data.products)
            ?
            data.products
            :
            [];


        showMessage(
            `${products.length} catalog product(s)`
        );


        renderProducts(products);

    }
    catch(error){

        console.error(
            "Catalog products error:",
            error
        );


        showMessage(
            "Unable to load catalog products.",
            "error-message"
        );

    }

}



function searchProducts(){

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if(!search){

        renderProducts(products);

        return;

    }


    const filtered =
        products.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();


            const description =
                String(
                    product.description || ""
                ).toLowerCase();


            const id =
                String(
                    product.id || ""
                ).toLowerCase();


            return (
                name.includes(search) ||
                description.includes(search) ||
                id.includes(search)
            );

        });


    renderProducts(filtered);


    showMessage(
        `${filtered.length} product(s) found`
    );

}



searchBtn.addEventListener(
    "click",
    searchProducts
);


searchInput.addEventListener(
    "keydown",
    event => {

        if(event.key === "Enter"){

            searchProducts();

        }

    }
);


searchInput.addEventListener(
    "input",
    () => {

        if(
            searchInput.value.trim() === ""
        ){

            renderProducts(products);

            showMessage(
                `${products.length} catalog product(s)`
            );

        }

    }
);


loadProducts();
