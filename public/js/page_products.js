import {
    apiFetch,
    requireLogin
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";


// --------------------------------------------------
// AUTH
// --------------------------------------------------

requireLogin();

loadSidebar("products");


// --------------------------------------------------
// STATE
// --------------------------------------------------

let products = [];

let currentView =
    localStorage.getItem("productsView") || "tiles";


// --------------------------------------------------
// DOM
// --------------------------------------------------

const tileView =
    document.getElementById("tileView");

const listView =
    document.getElementById("listView");

const productList =
    document.getElementById("productList");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const tileViewButton =
    document.getElementById("tileViewButton");

const listViewButton =
    document.getElementById("listViewButton");

const message =
    document.getElementById("message");

const productModal =
    document.getElementById("productModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeModal =
    document.getElementById("closeModal");

const productDetails =
    document.getElementById("productDetails");


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function escapeHtml(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// --------------------------------------------------
// MESSAGE
// --------------------------------------------------

function showMessage(
    text,
    type = "info"
){

    if(!message){

        return;

    }

    message.textContent = text;

    message.className =
        `message ${type}`;

}


function hideMessage(){

    if(!message){

        return;

    }

    message.textContent = "";

    message.className =
        "message hidden";

}


// --------------------------------------------------
// PRICE
// --------------------------------------------------

function numericPrice(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return null;

    }

    const cleaned =
        String(value)
            .replace(/[^0-9.-]/g, "");

    const number =
        Number(cleaned);

    if(Number.isNaN(number)){

        return null;

    }

    return number;

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

    const numeric =
        numericPrice(value);

    if(numeric === null){

        return escapeHtml(value);

    }

    try{

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency:
                    currency || "INR"
            }
        ).format(numeric);

    }
    catch(error){

        return escapeHtml(value);

    }

}


// --------------------------------------------------
// PRODUCT PRICE HTML
// --------------------------------------------------

function productPriceHtml(product){

    const mrp =
        product?.price;

    const salePrice =
        product?.sale_price;


    const hasMrp =
        mrp !== undefined &&
        mrp !== null &&
        String(mrp).trim() !== "";


    const hasSalePrice =
        salePrice !== undefined &&
        salePrice !== null &&
        String(salePrice).trim() !== "";


    /*
     * SALE PRICE + MRP
     */

    if(
        hasSalePrice &&
        hasMrp
    ){

        return `

            <div class="price-display">

                <span class="sale-price">
                    ${formatPrice(
                        salePrice,
                        product.currency
                    )}
                </span>

                <span class="mrp-price">
                    ${formatPrice(
                        mrp,
                        product.currency
                    )}
                </span>

            </div>

        `;

    }


    /*
     * ONLY NORMAL PRICE / MRP
     */

    if(hasMrp){

        return `

            <div class="price-display">

                <span class="sale-price">
                    ${formatPrice(
                        mrp,
                        product.currency
                    )}
                </span>

            </div>

        `;

    }


    return "";

}


// --------------------------------------------------
// DATE
// --------------------------------------------------

function formatDate(value){

    if(!value){

        return "";

    }

    const date =
        new Date(value);

    if(Number.isNaN(date.getTime())){

        return escapeHtml(value);

    }

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// --------------------------------------------------
// LABEL
// --------------------------------------------------

function formatLabel(key){

    return String(key)
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


// --------------------------------------------------
// VALUE
// --------------------------------------------------

function formatValue(
    key,
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "—";

    }


    if(
        key === "sale_price_effective_date"
    ){

        return formatDate(value);

    }


    if(
        typeof value === "boolean"
    ){

        return value
            ? "Yes"
            : "No";

    }


    if(
        typeof value === "object"
    ){

        try{

            return escapeHtml(
                JSON.stringify(
                    value,
                    null,
                    2
                )
            );

        }
        catch(error){

            return escapeHtml(
                String(value)
            );

        }

    }


    return escapeHtml(value);

}


// --------------------------------------------------
// URL CHECK
// --------------------------------------------------

function isUrl(value){

    if(!value){

        return false;

    }

    try{

        const url =
            new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    }
    catch(error){

        return false;

    }

}


// --------------------------------------------------
// IMAGE
// --------------------------------------------------

function productImage(
    product,
    className = ""
){

    if(product?.image_url){

        return `

            <img
                class="${className}"
                src="${escapeHtml(
                    product.image_url
                )}"
                alt="${escapeHtml(
                    product.name || "Product"
                )}"
                loading="lazy"
            >

        `;

    }


    return `

        <div class="${className} product-no-image">
            No Image
        </div>

    `;

}


// --------------------------------------------------
// PRODUCT GROUP
// --------------------------------------------------

function getGroupId(product){

    const groupId =
        product?.retailer_product_group_id;


    if(
        groupId !== null &&
        groupId !== undefined &&
        String(groupId).trim() !== ""
    ){

        return String(groupId);

    }


    return `single:${product?.id || ""}`;

}


// --------------------------------------------------
// BUILD VARIANT GROUPS
// --------------------------------------------------

function buildVariantGroups(){

    const groups =
        new Map();


    products.forEach(product => {

        const groupId =
            getGroupId(product);


        if(!groups.has(groupId)){

            groups.set(
                groupId,
                []
            );

        }


        groups
            .get(groupId)
            .push(product);

    });


    return groups;

}


// --------------------------------------------------
// GET PRODUCT VARIANTS
// --------------------------------------------------

function getVariantsForProduct(
    product
){

    const groupId =
        getGroupId(product);


    const groups =
        buildVariantGroups();


    return (
        groups.get(groupId) ||
        [product]
    );

}


// --------------------------------------------------
// HAS VARIANTS
// --------------------------------------------------

function hasVariants(product){

    return (
        getVariantsForProduct(product)
            .length > 1
    );

}


// --------------------------------------------------
// TILE VIEW
// --------------------------------------------------

function renderTiles(items){

    if(!items.length){

        tileView.innerHTML = "";

        return;

    }


    tileView.innerHTML =
        items.map(product => {

            const variants =
                getVariantsForProduct(
                    product
                );


            const variantBadge =
                variants.length > 1
                    ? `

                        <div class="variant-badge">

                            Variant

                            <span class="variant-count">
                                ${variants.length} options
                            </span>

                        </div>

                    `
                    : "";


            return `

                <article
                    class="product-card"
                    data-product-id="${escapeHtml(
                        product.id
                    )}"
                >

                    <div class="product-card-image">

                        ${productImage(
                            product
                        )}

                    </div>


                    <div class="product-card-body">

                        ${variantBadge}


                        <h3 class="product-card-name">
                            ${escapeHtml(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </h3>


                        <p class="product-card-description">

                            ${escapeHtml(
                                product.description ||
                                "No description available."
                            )}

                        </p>


                        <div class="product-card-price">

                            ${productPriceHtml(
                                product
                            )}

                        </div>


                        <div class="product-card-footer">

                            <span
                                class="availability ${
                                    product.availability === "in stock"
                                        ? "in-stock"
                                        : ""
                                }"
                            >

                                ${escapeHtml(
                                    product.availability ||
                                    "Unknown"
                                )}

                            </span>

                        </div>

                    </div>

                </article>

            `;

        }).join("");


    tileView
        .querySelectorAll(".product-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const id =
                        card.dataset.productId;


                    const product =
                        products.find(
                            item =>
                                String(item.id) ===
                                String(id)
                        );


                    if(product){

                        openProductModal(
                            product
                        );

                    }

                }
            );

        });

}


// --------------------------------------------------
// LIST VIEW
// --------------------------------------------------

function renderList(items){

    if(!items.length){

        productList.innerHTML = "";

        return;

    }


    productList.innerHTML =
        items.map(product => {

            const variants =
                getVariantsForProduct(
                    product
                );


            const variantBadge =
                variants.length > 1
                    ? `

                        <span class="table-variant-badge">
                            ${variants.length} variants
                        </span>

                    `
                    : "";


            return `

                <tr
                    data-product-id="${escapeHtml(
                        product.id
                    )}"
                >

                    <td>

                        <div class="list-product">

                            <div class="list-product-image">

                                ${productImage(
                                    product
                                )}

                            </div>


                            <div>

                                <div class="list-product-name">

                                    ${escapeHtml(
                                        product.name ||
                                        "Unnamed Product"
                                    )}

                                </div>


                                ${variantBadge}

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHtml(
                            product.retailer_id ||
                            "—"
                        )}
                    </td>


                    <td>

                        ${productPriceHtml(
                            product
                        )}

                    </td>


                    <td>

                        <span
                            class="availability ${
                                product.availability === "in stock"
                                    ? "in-stock"
                                    : ""
                            }"
                        >

                            ${escapeHtml(
                                product.availability ||
                                "Unknown"
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHtml(
                            product.id ||
                            "—"
                        )}

                    </td>

                </tr>

            `;

        }).join("");


    productList
        .querySelectorAll("tr")
        .forEach(row => {

            row.addEventListener(
                "click",
                () => {

                    const id =
                        row.dataset.productId;


                    const product =
                        products.find(
                            item =>
                                String(item.id) ===
                                String(id)
                        );


                    if(product){

                        openProductModal(
                            product
                        );

                    }

                }
            );

        });

}


// --------------------------------------------------
// RENDER PRODUCTS
// --------------------------------------------------

function renderProducts(items){

    renderTiles(items);

    renderList(items);

}


// --------------------------------------------------
// SET VIEW
// --------------------------------------------------

function setView(view){

    currentView =
        view === "list"
            ? "list"
            : "tiles";


    localStorage.setItem(
        "productsView",
        currentView
    );


    if(currentView === "tiles"){

        tileView.classList.remove(
            "hidden"
        );

        listView.classList.add(
            "hidden"
        );


        tileViewButton.classList.add(
            "active"
        );

        listViewButton.classList.remove(
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


        tileViewButton.classList.remove(
            "active"
        );

        listViewButton.classList.add(
            "active"
        );

    }

}


// --------------------------------------------------
// DETAIL ITEM
// --------------------------------------------------

function detailItem(
    label,
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        value = "—";

    }


    let htmlValue;


    if(isUrl(value)){

        htmlValue = `

            <a
                href="${escapeHtml(value)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${escapeHtml(value)}
            </a>

        `;

    }
    else{

        htmlValue =
            formatValue(
                label,
                value
            );

    }


    return `

        <div class="detail-item">

            <div class="detail-label">
                ${escapeHtml(
                    formatLabel(label)
                )}
            </div>


            <div class="detail-value">
                ${htmlValue}
            </div>

        </div>

    `;

}


// --------------------------------------------------
// VARIANT SECTION
// --------------------------------------------------

function renderVariantSection(
    product
){

    const variants =
        getVariantsForProduct(
            product
        );


    if(variants.length <= 1){

        return "";

    }


    return `

        <section class="details-section variants-section">

            <h3 class="details-section-title">
                Variants
            </h3>


            <div class="variant-list">

                ${variants.map(
                    variant => {

                        const selected =
                            String(
                                variant.id
                            ) ===
                            String(
                                product.id
                            );


                        return `

                            <button
                                type="button"
                                class="variant-option ${
                                    selected
                                        ? "selected"
                                        : ""
                                }"
                                data-variant-id="${escapeHtml(
                                    variant.id
                                )}"
                            >

                                <div class="variant-image">

                                    ${productImage(
                                        variant
                                    )}

                                </div>


                                <div class="variant-option-body">

                                    <div class="variant-option-name">

                                        ${escapeHtml(
                                            variant.name ||
                                            "Unnamed Product"
                                        )}

                                    </div>


                                    <div class="variant-option-price">

                                        ${productPriceHtml(
                                            variant
                                        )}

                                    </div>


                                    ${
                                        selected
                                            ? `
                                                <div class="variant-selected-label">
                                                    Selected
                                                </div>
                                              `
                                            : ""
                                    }

                                </div>

                            </button>

                        `;

                    }
                ).join("")}

            </div>

        </section>

    `;

}


// --------------------------------------------------
// MODAL
// --------------------------------------------------

function openProductModal(
    product
){

    const variants =
        getVariantsForProduct(
            product
        );


    /*
     * Find fields that are not
     * explicitly shown below.
     */

    const knownFields =
        new Set([
            "id",
            "retailer_id",
            "retailer_product_group_id",
            "name",
            "description",
            "price",
            "sale_price",
            "currency",
            "sale_price_effective_date",
            "availability",
            "condition",
            "brand",
            "url",
            "image_url"
        ]);


    const extraFields =
        Object.keys(product)
            .filter(
                key =>
                    !knownFields.has(key)
            );


    productDetails.innerHTML = `

        <!-- PRODUCT PREVIEW -->

        <section class="modal-product-header">

            <div class="modal-product-image">

                ${productImage(
                    product
                )}

            </div>


            <div class="modal-product-summary">

                <h2 id="modalProductName">

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </h2>


                <div class="modal-product-price">

                    ${productPriceHtml(
                        product
                    )}

                </div>


                <div class="modal-availability">

                    ${escapeHtml(
                        product.availability ||
                        "Unknown"
                    )}

                </div>

            </div>

        </section>


        <!-- VARIANTS -->

        ${renderVariantSection(
            product
        )}


        <!-- BASIC INFORMATION -->

        <section class="details-section">

            <h3 class="details-section-title">
                Basic Information
            </h3>


            <div class="details-grid">

                ${detailItem(
                    "id",
                    product.id
                )}

                ${detailItem(
                    "retailer_id",
                    product.retailer_id
                )}

                ${detailItem(
                    "retailer_product_group_id",
                    product.retailer_product_group_id
                )}

                ${detailItem(
                    "availability",
                    product.availability
                )}

                ${detailItem(
                    "condition",
                    product.condition
                )}

                ${detailItem(
                    "brand",
                    product.brand
                )}

            </div>

        </section>


        <!-- DESCRIPTION -->

        <section class="details-section">

            <h3 class="details-section-title">
                Description
            </h3>


            <div class="description-text">

                ${
                    product.description
                        ? escapeHtml(
                            product.description
                        )
                        : "No description available."
                }

            </div>

        </section>


        <!-- PRICING -->

        <section class="details-section">

            <h3 class="details-section-title">
                Pricing
            </h3>


            <div class="details-grid">

                ${detailItem(
                    "MRP",
                    product.price
                        ? formatPrice(
                            product.price,
                            product.currency
                        )
                        : null
                )}


                ${detailItem(
                    "sale_price",
                    product.sale_price
                        ? formatPrice(
                            product.sale_price,
                            product.currency
                        )
                        : null
                )}


                ${detailItem(
                    "currency",
                    product.currency
                )}


                ${detailItem(
                    "sale_price_effective_date",
                    product.sale_price_effective_date
                )}

            </div>

        </section>


        <!-- PRODUCT LINK -->

        <section class="details-section">

            <h3 class="details-section-title">
                Product Link
            </h3>


            <div class="detail-value">

                ${
                    isUrl(product.url)
                        ? `
                            <a
                                href="${escapeHtml(
                                    product.url
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escapeHtml(
                                    product.url
                                )}
                            </a>
                          `
                        : "—"
                }

            </div>

        </section>


        <!-- ADDITIONAL META FIELDS -->

        ${
            extraFields.length
                ? `

                    <section class="details-section">

                        <h3 class="details-section-title">
                            Additional Meta Fields
                        </h3>


                        <div class="details-grid">

                            ${extraFields.map(
                                key =>
                                    detailItem(
                                        key,
                                        product[key]
                                    )
                            ).join("")}

                        </div>

                    </section>

                  `
                : ""
        }

    `;


    /*
     * Variant buttons
     */

    productDetails
        .querySelectorAll(
            ".variant-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const variantId =
                        button.dataset.variantId;


                    const selectedProduct =
                        products.find(
                            item =>
                                String(item.id) ===
                                String(variantId)
                        );


                    if(selectedProduct){

                        openProductModal(
                            selectedProduct
                        );

                    }

                }
            );

        });


    productModal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );

}


// --------------------------------------------------
// CLOSE MODAL
// --------------------------------------------------

function closeProductModal(){

    productModal.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


// --------------------------------------------------
// SEARCH
// --------------------------------------------------

function matchesSearch(
    product,
    search
){

    return Object.values(
        product
    ).some(value => {

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
            catch(error){

                return false;

            }

        }


        return String(value)
            .toLowerCase()
            .includes(search);

    });

}


// --------------------------------------------------
// APPLY SEARCH
// --------------------------------------------------

function applySearch(){

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if(!search){

        renderProducts(
            products
        );

        hideMessage();

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


    renderProducts(
        filtered
    );


    if(!filtered.length){

        showMessage(
            "Nothing to display",
            "info"
        );

    }
    else{

        hideMessage();

    }

}


// --------------------------------------------------
// LOAD PRODUCTS
// --------------------------------------------------

async function loadProducts(){

    showMessage(
        "Loading products...",
        "info"
    );


    try{

        const response =
            await apiFetch(
                "/products"
            );


        console.log(
            "Products API response:",
            response
        );


        if(
            !response ||
            response.success !== true
        ){

            throw new Error(
                response?.message ||
                "Unable to load products"
            );

        }


        products =
            Array.isArray(
                response.products
            )
                ? response.products
                : [];


        if(!products.length){

            renderProducts([]);

            showMessage(
                "Nothing to display",
                "info"
            );

            return;

        }


        hideMessage();


        renderProducts(
            products
        );

    }
    catch(error){

        console.error(
            "Product loading error:",
            error
        );


        products = [];


        renderProducts([]);


        showMessage(
            error?.message ||
            "Unable to load products",
            "error"
        );

    }

}


// --------------------------------------------------
// EVENTS
// --------------------------------------------------

tileViewButton.addEventListener(
    "click",
    () => {

        setView("tiles");

    }
);


listViewButton.addEventListener(
    "click",
    () => {

        setView("list");

    }
);


searchButton.addEventListener(
    "click",
    () => {

        applySearch();

    }
);


searchInput.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Enter"
        ){

            applySearch();

        }

    }
);


closeModal.addEventListener(
    "click",
    () => {

        closeProductModal();

    }
);


modalOverlay.addEventListener(
    "click",
    () => {

        closeProductModal();

    }
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


// --------------------------------------------------
// INITIALIZE
// --------------------------------------------------

setView(
    currentView
);

loadProducts();
