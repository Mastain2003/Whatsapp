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
    localStorage.getItem("productsView") || "tiles";


/* =========================================================
   HELPERS
========================================================= */


function escapeHtml(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showMessage(
    text,
    type = ""
){

    message.textContent = text;

    message.className = type;

}


function formatPrice(
    value,
    currency = "INR"
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "";

    }


    const number =
        Number(value);


    if(Number.isNaN(number)){

        return escapeHtml(value);

    }


    try{

        return new Intl.NumberFormat(
            "en-IN",
            {
                style:"currency",
                currency:currency || "INR"
            }
        ).format(number);

    }
    catch{

        return `${currency || "INR"} ${number}`;

    }

}


function formatDate(value){

    if(!value){

        return "";

    }


    const date =
        new Date(value);


    if(Number.isNaN(date.getTime())){

        return String(value);

    }


    return date.toLocaleString(
        "en-IN"
    );

}


function formatLabel(key){

    return String(key)
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

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


function isUrl(value){

    return (
        typeof value === "string" &&
        /^https?:\/\//i.test(
            value.trim()
        )
    );

}


/* =========================================================
   IMAGE
========================================================= */


function productImage(
    product,
    className
){

    const image =
        product.image_url;


    if(!image){

        return `
            <div class="${className}-no-image">
                No image
            </div>
        `;

    }


    return `
        <img
            class="${className}"
            src="${escapeHtml(image)}"
            alt="${escapeHtml(
                product.name || "Product"
            )}"
            loading="lazy"
        >
    `;

}


/* =========================================================
   TILE VIEW
========================================================= */


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


        const image =
            productImage(
                product,
                "product-card-image"
            );


        card.innerHTML = `

            ${image}


            <div class="product-card-body">

                <div class="product-card-name">

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </div>


                <div class="product-card-description">

                    ${escapeHtml(
                        product.description || ""
                    )}

                </div>


                <div class="product-card-footer">

                    <div class="product-card-price">

                        ${
                            product.price !== undefined &&
                            product.price !== null &&
                            product.price !== ""

                            ?

                            formatPrice(
                                product.price,
                                product.currency
                            )

                            :

                            ""
                        }

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


/* =========================================================
   LIST VIEW
========================================================= */


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

                ${productImage(
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
                        product.name ||
                        "Unnamed Product"
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

                    ${
                        product.price !== undefined &&
                        product.price !== null &&
                        product.price !== ""

                        ?

                        formatPrice(
                            product.price,
                            product.currency
                        )

                        :

                        ""
                    }

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


/* =========================================================
   RENDER
========================================================= */


function renderProducts(items){

    renderTiles(items);

    renderList(items);

}


/* =========================================================
   VIEW SWITCH
========================================================= */


function setView(view){

    currentView = view;

    localStorage.setItem(
        "productsView",
        view
    );


    if(view === "list"){

        tileView.classList.add("hidden");

        listView.classList.remove("hidden");

        tileViewBtn.classList.remove("active");

        listViewBtn.classList.add("active");

    }
    else{

        listView.classList.add("hidden");

        tileView.classList.remove("hidden");

        listViewBtn.classList.remove("active");

        tileViewBtn.classList.add("active");

    }

}


/* =========================================================
   MODAL
========================================================= */


function detailItem(
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


    let display;


    if(isUrl(value)){

        display = `

            <a
                href="${escapeHtml(value)}"
                target="_blank"
                rel="noopener noreferrer">

                ${escapeHtml(value)}

            </a>

        `;

    }
    else{

        display =
            escapeHtml(
                formatValue(value)
            );

    }


    return `

        <div class="detail-item">

            <span class="detail-label">

                ${escapeHtml(label)}

            </span>


            <span class="detail-value">

                ${display}

            </span>

        </div>

    `;

}


function openProductModal(product){

    const image =
        productImage(
            product,
            "modal-product-image"
        );


    /*
     * Header
     */

    const header = `

        <div class="modal-product-header">

            <div class="modal-product-image-wrap">

                ${image}

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

                        ${formatPrice(
                            product.price,
                            product.currency
                        )}

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


    /*
     * Basic information
     */

    const basic = [

        detailItem(
            "Product ID",
            product.id
        ),

        detailItem(
            "Retailer ID",
            product.retailer_id
        ),

        detailItem(
            "Brand",
            product.brand
        ),

        detailItem(
            "Condition",
            product.condition
        ),

        detailItem(
            "Availability",
            product.availability
        ),

        detailItem(
            "Currency",
            product.currency
        )

    ].join("");


    const basicSection = basic
        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Basic Information

            </h3>


            <div class="details-grid">

                ${basic}

            </div>

        </div>

        `

        :

        "";


    /*
     * Description
     */

    const descriptionSection =
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


    /*
     * Pricing
     */

    const pricing = [

        detailItem(
            "Price",
            product.price !== undefined &&
            product.price !== null &&
            product.price !== ""

                ?

                formatPrice(
                    product.price,
                    product.currency
                )

                :

                ""
        ),

        detailItem(
            "Currency",
            product.currency
        ),

        detailItem(
            "Sale Price",
            product.sale_price !== undefined &&
            product.sale_price !== null &&
            product.sale_price !== ""

                ?

                formatPrice(
                    product.sale_price,
                    product.currency
                )

                :

                ""
        ),

        detailItem(
            "Sale Price Effective Date",
            formatDate(
                product.sale_price_effective_date
            )
        )

    ].join("");


    const pricingSection = pricing
        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Pricing

            </h3>


            <div class="details-grid">

                ${pricing}

            </div>

        </div>

        `

        :

        "";


    /*
     * URL
     */

    const urlSection =
        product.url

        ?

        `

        <div class="details-section">

            <h3 class="details-section-title">

                Product Link

            </h3>


            <div class="details-grid">

                ${detailItem(
                    "Product URL",
                    product.url
                )}

            </div>

        </div>

        `

        :

        "";


    /*
     * Extra fields returned by Meta
     */

    const knownFields = [

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

    ];


    const extraFields =
        Object.entries(product)
            .filter(([key, value]) => {

                if(
                    knownFields.includes(key)
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

            });


    let extraSection = "";


    if(extraFields.length){

        const extraHtml =
            extraFields
                .map(([key, value]) => {

                    return `

                        <div class="extra-field">

                            <div class="extra-field-label">

                                ${escapeHtml(
                                    formatLabel(key)
                                )}

                            </div>


                            <div class="extra-field-value">

                                ${escapeHtml(
                                    formatValue(value)
                                )}

                            </div>

                        </div>

                    `;

                })
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


    /*
     * Put everything into modal
     */

    productDetails.innerHTML =

        header +

        descriptionSection +

        basicSection +

        pricingSection +

        urlSection +

        extraSection;


    productModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


function closeProductModal(){

    productModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   SEARCH
========================================================= */


function matchesSearch(
    product,
    search
){

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

        });

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
        products.filter(
            product =>
                matchesSearch(
                    product,
                    search
                )
        );


    renderProducts(filtered);


    showMessage(
        `${filtered.length} product(s) found`
    );

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */


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


        console.log(
            "Products API response:",
            data
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
                ? data.products
                : [];


        renderProducts(products);


        showMessage(
            `${products.length} catalog product(s)`
        );

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


/* =========================================================
   EVENTS
========================================================= */


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


/* =========================================================
   START
========================================================= */


setView(currentView);

loadProducts();
