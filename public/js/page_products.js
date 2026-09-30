import {
    apiFetch,
    requireLogin
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";


requireLogin();

loadSidebar("products");



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

const productDetails =
    document.getElementById("productDetails");

const closeModal =
    document.getElementById("closeModal");

const modalOverlay =
    document.getElementById("modalOverlay");



let products = [];

let currentView =
    localStorage.getItem("productsView") ||
    "tiles";



/* =========================
   HELPERS
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



function showMessage(
    text,
    type = ""
){

    message.innerText = text;

    message.className = type;

}



function formatPrice(product){

    const value =
        product.price;

    if(
        value === undefined ||
        value === null ||
        value === ""
    ){

        return "";

    }


    const price =
        Number(value);


    if(Number.isNaN(price)){

        return escapeHtml(value);

    }


    const currency =
        product.currency ||
        "INR";


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



function formatValue(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    if(
        typeof value === "object"
    ){

        try{

            return JSON.stringify(
                value,
                null,
                2
            );

        }
        catch{

            return String(value);

        }

    }


    if(typeof value === "boolean"){

        return value
            ? "Yes"
            : "No";

    }


    return String(value);

}



function formatDetailLabel(key){

    return String(key)

        .replaceAll("_"," ")

        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

}



function isUrl(value){

    if(
        typeof value !== "string"
    ){

        return false;

    }


    return /^https?:\/\//i.test(
        value.trim()
    );

}



function getImageHtml(
    product,
    className = "product-image"
){

    const imageUrl =
        product.image_url || "";


    if(!imageUrl){

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
            <div class="empty-message">
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


        const imageUrl =
            product.image_url || "";


        const imageHtml =
            imageUrl

            ?

            `
            <img
                class="product-card-image"
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(
                    product.name || "Product"
                )}"
                loading="lazy"
            >
            `

            :

            `
            <div class="product-card-no-image">
                No image
            </div>
            `;


        card.innerHTML = `

            ${imageHtml}


            <div class="product-card-body">

                <div class="product-card-name">

                    ${escapeHtml(
                        product.name || "Unnamed Product"
                    )}

                </div>


                <div class="product-card-description">

                    ${escapeHtml(
                        product.description || ""
                    )}

                </div>


                <div class="product-card-footer">

                    <div class="product-card-price">

                        ${formatPrice(product)}

                    </div>


                    ${
                        product.availability

                        ?

                        `
                        <div class="product-card-availability">

                            ${escapeHtml(
                                product.availability
                            )}

                        </div>
                        `

                        :

                        ""

                    }

                </div>

            </div>

        `;


        card.addEventListener(
            "click",
            () => openProductModal(product)
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

        productList.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-message">

                    Nothing to display

                </td>

            </tr>

        `;

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
   VIEW SWITCH
========================= */


function setView(view){

    currentView = view;

    localStorage.setItem(
        "productsView",
        view
    );


    if(view === "list"){

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
    else{

        listView.classList.add(
            "hidden"
        );

        tileView.classList.remove(
            "hidden"
        );

        listViewBtn.classList.remove(
            "active"
        );

        tileViewBtn.classList.add(
            "active"
        );

    }

}



function initializeView(){

    setView(currentView);

}



/* =========================
   MODAL DETAILS
========================= */


function createDetailItem(
    label,
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "";

    }


    const formatted =
        formatValue(value);


    if(!formatted){

        return "";

    }


    let displayValue;


    if(isUrl(formatted)){

        displayValue = `

            <a
                href="${escapeHtml(formatted)}"
                target="_blank"
                rel="noopener noreferrer">

                ${escapeHtml(formatted)}

            </a>

        `;

    }
    else{

        displayValue =
            escapeHtml(formatted);

    }


    return `

        <div class="detail-item">

            <span class="detail-label">

                ${escapeHtml(label)}

            </span>


            <span class="detail-value">

                ${displayValue}

            </span>

        </div>

    `;

}



function openProductModal(product){

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
                product.name || "Product"
            )}"
        >
        `

        :

        `
        <div class="modal-product-no-image">

            No image

        </div>
        `;



    /* =========================
       HEADER
    ========================= */


    const headerHtml = `

        <div class="modal-product-header">


            <div class="modal-product-image-wrap">

                ${imageHtml}

            </div>


            <div class="modal-product-summary">

                <h2
                    id="modalProductName"
                    class="modal-product-name">

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </h2>


                ${
                    product.price !== undefined &&
                    product.price !== null &&
                    product.price !== ""

                    ?

                    `
                    <div class="modal-product-price">

                        ${formatPrice(product)}

                    </div>
                    `

                    :

                    ""

                }


                ${
                    product.availability

                    ?

                    `
                    <div class="modal-product-availability">

                        ${escapeHtml(
                            product.availability
                        )}

                    </div>
                    `

                    :

                    ""

                }

            </div>


        </div>

    `;



    /* =========================
       BASIC INFORMATION
    ========================= */


    const basicFields = [

        [
            "Product ID",
            product.id
        ],

        [
            "Retailer ID",
            product.retailer_id
        ],

        [
            "Brand",
            product.brand
        ],

        [
            "Condition",
            product.condition
        ],

        [
            "Availability",
            product.availability
        ],

        [
            "Currency",
            product.currency
        ]

    ];


    const basicHtml =
        basicFields

            .map(
                ([label,value]) =>
                    createDetailItem(
                        label,
                        value
                    )
            )

            .join("");



    /* =========================
       DESCRIPTION
    ========================= */


    const descriptionHtml =
        product.description

        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Description

            </h3>


            <p class="description-text">

                ${escapeHtml(
                    product.description
                )}

            </p>

        </div>

        `

        :

        "";



    /* =========================
       BASIC INFO SECTION
    ========================= */


    const basicSection =

        basicHtml

        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Basic Information

            </h3>


            <div class="details-grid">

                ${basicHtml}

            </div>

        </div>

        `

        :

        "";



    /* =========================
       PRICING
    ========================= */


    const pricingFields = [

        [
            "Price",
            product.price !== undefined &&
            product.price !== null &&
            product.price !== ""

                ?

                formatPrice(product)

                :

                null
        ],

        [
            "Currency",
            product.currency
        ],

        [
            "Sale Price",
            product.sale_price !== undefined &&
            product.sale_price !== null &&
            product.sale_price !== ""

                ?

                formatSalePrice(product)

                :

                null
        ],

        [
            "Sale Price Effective Date",
            product.sale_price_effective_date
        ]

    ];


    const pricingHtml =
        pricingFields

            .map(
                ([label,value]) =>
                    createDetailItem(
                        label,
                        value
                    )
            )

            .join("");



    const pricingSection =

        pricingHtml

        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Pricing

            </h3>


            <div class="details-grid">

                ${pricingHtml}

            </div>

        </div>

        `

        :

        "";



    /* =========================
       LINKS
    ========================= */


    const linksHtml =
        createDetailItem(
            "Product URL",
            product.url
        );


    const linksSection =

        linksHtml

        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Product Link

            </h3>


            <div class="details-grid">

                ${linksHtml}

            </div>

        </div>

        `

        :

        "";



    /* =========================
       EXTRA FIELDS
    ========================= */


    const knownFields = new Set([

        "id",

        "retailer_id",

        "name",

        "description",

        "price",

        "currency",

        "image_url",

        "availability",

        "brand",

        "condition",

        "url",

        "sale_price",

        "sale_price_effective_date"

    ]);


    const extraFields =
        Object.entries(product)

            .filter(
                ([key,value]) => {

                    if(
                        knownFields.has(key)
                    ){

                        return false;

                    }


                    if(
                        value === null ||
                        value === undefined ||
                        value === ""
                    ){

                        return false;

                    }


                    return true;

                }
            );



    let extraSection = "";


    if(extraFields.length){

        const extraHtml =
            extraFields

                .map(
                    ([key,value]) => `

                        <div class="extra-field">

                            <div class="extra-field-label">

                                ${escapeHtml(
                                    formatDetailLabel(key)
                                )}

                            </div>


                            <div class="extra-field-value">

                                ${escapeHtml(
                                    formatValue(value)
                                )}

                            </div>

                        </div>

                    `
                )

                .join("");


        extraSection = `

            <div class="details-section">

                <h3 class="details-section-title">

                    Additional Catalog Information

                </h3>


                <div class="extra-fields-grid">

                    ${extraHtml}

                </div>

            </div>

        `;

    }



    productDetails.innerHTML =

        headerHtml +

        descriptionHtml +

        basicSection +

        pricingSection +

        linksSection +

        extraSection;



    productModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}



/* =========================
   SALE PRICE
========================= */


function formatSalePrice(product){

    const value =
        product.sale_price;


    if(
        value === undefined ||
        value === null ||
        value === ""
    ){

        return "";

    }


    const price =
        Number(value);


    if(Number.isNaN(price)){

        return String(value);

    }


    const currency =
        product.currency ||
        "INR";


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



/* =========================
   CLOSE MODAL
========================= */


function closeProductModal(){

    productModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}



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
            await apiFetch(
                "/products"
            );


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



/* =========================
   SEARCH
========================= */


function valueMatchesSearch(
    value,
    search
){

    if(
        value === null ||
        value === undefined
    ){

        return false;

    }


    if(
        typeof value === "object"
    ){

        try{

            return JSON.stringify(
                value
            )
            .toLowerCase()
            .includes(search);

        }
        catch{

            return false;

        }

    }


    return String(value)
        .toLowerCase()
        .includes(search);

}



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

            return Object.values(
                product
            ).some(
                value =>
                    valueMatchesSearch(
                        value,
                        search
                    )
            );

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

        if(
            event.key === "Enter"
        ){

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
    () => setView("tiles")
);


listViewBtn.addEventListener(
    "click",
    () => setView("list")
);


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
   START
========================= */


initializeView();

loadProducts();
