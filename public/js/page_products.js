import {
    apiFetch,
    requireLogin
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";


requireLogin();

loadSidebar("products");



/* =========================
   ELEMENTS
========================= */


const tileView =
    document.getElementById("tileView");

const listView =
    document.getElementById("listView");

const productList =
    document.getElementById("productList");

const searchInput =
    document.getElementById("search");

const searchBtn =
    document.getElementById("searchBtn");

const message =
    document.getElementById("message");

const tileViewBtn =
    document.getElementById("tileViewBtn");

const listViewBtn =
    document.getElementById("listViewBtn");

const productModal =
    document.getElementById("productModal");

const closeModal =
    document.getElementById("closeModal");

const modalOverlay =
    document.querySelector(".modal-overlay");

const productDetails =
    document.getElementById("productDetails");



/* =========================
   STATE
========================= */


let products = [];

let currentView = "tile";



/* =========================
   HTML ESCAPE
========================= */


function escapeHtml(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}



/* =========================
   MESSAGE
========================= */


function showMessage(
    text,
    type = ""
){

    message.innerText = text;

    message.className = type;

}



/* =========================
   PRICE
========================= */


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

        return escapeHtml(
            product.price
        );

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

        return `${escapeHtml(currency)} ${price}`;

    }

}



/* =========================
   IMAGE
========================= */


function getImageHtml(
    product,
    className = "product-image"
){

    const imageUrl =
        product.image_url || "";


    if(!imageUrl){

        if(
            className ===
            "product-card-image"
        ){

            return `
                <div class="product-card-no-image">
                    No image
                </div>
            `;

        }


        return `
            <div class="no-image">
                No image
            </div>
        `;

    }


    return `
        <img
            class="${className}"
            src="${escapeHtml(imageUrl)}"
            alt="${escapeHtml(
                product.name || "Product"
            )}"
            loading="lazy"
        >
    `;

}



/* =========================
   TILE VIEW
========================= */


function renderTiles(items){

    tileView.innerHTML = "";


    if(!items.length){

        tileView.innerHTML = `
            <div class="tile-empty">
                Nothing to display
            </div>
        `;

        return;

    }


    items.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.tabIndex = 0;


        card.innerHTML = `

            ${getImageHtml(
                product,
                "product-card-image"
            )}


            <div class="product-card-body">

                <div class="product-card-name">

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </div>


                <div class="product-card-description">

                    ${escapeHtml(
                        product.description ||
                        "No description available."
                    )}

                </div>


                <div class="product-card-footer">

                    <div class="product-card-price">

                        ${formatPrice(product)}

                    </div>


                    <div class="product-card-availability">

                        ${escapeHtml(
                            product.availability ||
                            "Unknown"
                        )}

                    </div>

                </div>

            </div>

        `;


        card.addEventListener(
            "click",
            () => openProductModal(product)
        );


        card.addEventListener(
            "keydown",
            event => {

                if(
                    event.key === "Enter" ||
                    event.key === " "
                ){

                    event.preventDefault();

                    openProductModal(product);

                }

            }
        );


        tileView.appendChild(card);

    });

}



/* =========================
   LIST VIEW
========================= */


function renderList(items){

    productList.innerHTML = "";


    if(!items.length){

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td
                colspan="6"
                class="empty-message"
            >

                Nothing to display

            </td>

        `;


        productList.appendChild(row);

        return;

    }


    items.forEach(product => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                ${getImageHtml(
                    product,
                    "product-image"
                )}

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


        row.addEventListener(
            "click",
            () => openProductModal(product)
        );


        productList.appendChild(row);

    });

}



/* =========================
   RENDER BOTH VIEWS
========================= */


function renderProducts(items){

    renderTiles(items);

    renderList(items);

}



/* =========================
   VIEW SWITCHING
========================= */


function setView(view){

    currentView = view;


    if(view === "tile"){

        tileView.classList.remove(
            "hidden"
        );

        listView.classList.add(
            "hidden"
        );


        tileViewBtn.classList.add(
            "active"
        );

        listViewBtn.classList.remove(
            "active"
        );

    }
    else{

        tileView.classList.add(
            "hidden"
        );

        listView.classList.remove(
            "hidden"
        );


        tileViewBtn.classList.remove(
            "active"
        );

        listViewBtn.classList.add(
            "active"
        );

    }


    localStorage.setItem(
        "productsView",
        view
    );

}



/* =========================
   PRODUCT DETAILS
========================= */


function formatDetailLabel(key){

    return String(key)

        .replaceAll("_"," ")

        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}



function formatDetailValue(
    key,
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return `
            <span class="empty">
                Not available
            </span>
        `;

    }


    /*
     * Objects / arrays returned by Meta
     * are displayed as readable JSON.
     */

    if(
        typeof value === "object"
    ){

        return escapeHtml(
            JSON.stringify(
                value,
                null,
                2
            )
        );

    }


    if(
        key === "price"
    ){

        return formatPrice({
            price:value,
            currency:
                currentModalProduct?.currency ||
                "INR"
        });

    }


    return escapeHtml(value);

}



let currentModalProduct = null;



function openProductModal(product){

    currentModalProduct = product;


    const imageUrl =
        product.image_url || "";


    const imageHtml =
        imageUrl

        ?

        `
            <img
                class="modal-product-image"
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(
                    product.name ||
                    "Product"
                )}"
            >
        `

        :

        `
            <div class="modal-product-no-image">
                No image available
            </div>
        `;



    /*
     * Fields displayed at the top.
     */

    const topFields = [

        "id",
        "retailer_id",
        "name",
        "price",
        "currency",
        "availability"

    ];



    /*
     * Build all remaining fields
     * returned by Meta.
     */

    const remainingFields =
        Object.entries(product)
            .filter(
                ([key]) =>
                    !topFields.includes(key) &&
                    key !== "image_url"
            );



    let detailsHtml = "";



    if(remainingFields.length){

        detailsHtml = `

            <h3 class="detail-section-title">
                Product Details
            </h3>


            <div class="detail-grid">

                ${remainingFields.map(
                    ([key,value]) => `

                    <div class="detail-item">

                        <span class="detail-label">

                            ${escapeHtml(
                                formatDetailLabel(key)
                            )}

                        </span>


                        <div class="detail-value">

                            ${formatDetailValue(
                                key,
                                value
                            )}

                        </div>

                    </div>

                `
                ).join("")}

            </div>

        `;

    }



    productDetails.innerHTML = `

        <div class="modal-product-header">

            <div>

                ${imageHtml}

            </div>


            <div>

                <h2
                    id="modalProductName"
                    class="modal-product-title"
                >

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </h2>


                <div class="modal-product-price">

                    ${formatPrice(product)}

                </div>


                <div class="modal-product-description">

                    ${escapeHtml(
                        product.description ||
                        "No description available."
                    )}

                </div>

            </div>

        </div>



        <h3 class="detail-section-title">
            Basic Information
        </h3>


        <div class="detail-grid">

            <div class="detail-item">

                <span class="detail-label">
                    Product ID
                </span>

                <div class="detail-value">

                    ${escapeHtml(
                        product.id || ""
                    )}

                </div>

            </div>


            <div class="detail-item">

                <span class="detail-label">
                    Retailer ID
                </span>

                <div class="detail-value">

                    ${escapeHtml(
                        product.retailer_id ||
                        ""
                    )}

                </div>

            </div>


            <div class="detail-item">

                <span class="detail-label">
                    Currency
                </span>

                <div class="detail-value">

                    ${escapeHtml(
                        product.currency ||
                        ""
                    )}

                </div>

            </div>


            <div class="detail-item">

                <span class="detail-label">
                    Availability
                </span>

                <div class="detail-value">

                    ${escapeHtml(
                        product.availability ||
                        ""
                    )}

                </div>

            </div>

        </div>


        ${detailsHtml}

    `;


    productModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}



/* =========================
   CLOSE MODAL
========================= */


function closeProductModal(){

    productModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";


    currentModalProduct = null;

}


closeModal.addEventListener(
    "click",
    closeProductModal
);


modalOverlay.addEventListener(
    "click",
    closeProductModal
);


document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            !productModal.classList.contains(
                "hidden"
            )
        ){

            closeProductModal();

        }

    }
);



/* =========================
   LOAD PRODUCTS
========================= */


async function loadProducts(){

    showMessage(
        "Loading catalog products...",
        "loading-message"
    );


    tileView.innerHTML = "";

    productList.innerHTML = "";


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


        /*
         * Restore user's previous view.
         */

        const savedView =
            localStorage.getItem(
                "productsView"
            );


        if(
            savedView === "list" ||
            savedView === "tile"
        ){

            setView(savedView);

        }
        else{

            setView("tile");

        }

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



/* =========================
   SEARCH
========================= */


function searchProducts(){

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if(!search){

        renderProducts(products);


        showMessage(
            `${products.length} catalog product(s)`
        );


        return;

    }


    const filtered =
        products.filter(product => {

            /*
             * Search all primitive fields returned
             * by Meta, not just name/description/id.
             */

            return Object.values(product)
                .some(value => {

                    if(
                        value === null ||
                        value === undefined
                    ){

                        return false;

                    }


                    if(
                        typeof value === "object"
                    ){

                        return JSON.stringify(
                            value
                        )
                        .toLowerCase()
                        .includes(search);

                    }


                    return String(value)
                        .toLowerCase()
                        .includes(search);

                });

        });


    renderProducts(filtered);


    showMessage(
        `${filtered.length} product(s) found`
    );

}



/* =========================
   EVENTS
========================= */


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


tileViewBtn.addEventListener(
    "click",
    () => setView("tile")
);


listViewBtn.addEventListener(
    "click",
    () => setView("list")
);



/* =========================
   START
========================= */


loadProducts();
