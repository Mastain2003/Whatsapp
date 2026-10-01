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



/* =========================================
   BASIC HELPERS
========================================= */


function escapeHtml(value){

    if(value === null || value === undefined){

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

    message.textContent = text;

    message.className = type;

}



/*
 * Meta is returning prices such as:
 *
 * "₹120.00"
 *
 * instead of:
 *
 * "120.00"
 *
 * So remove currency symbols before formatting.
 */
function numericPrice(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return null;

    }


    if(typeof value === "number"){

        return value;

    }


    const cleaned =
        String(value)
            .replace(/[^\d.-]/g,"");


    if(!cleaned){

        return null;

    }


    const number =
        Number(cleaned);


    return Number.isNaN(number)
        ? null
        : number;

}



function formatPrice(
    value,
    currency = "INR"
){

    const number =
        numericPrice(value);


    if(number === null){

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


    return date.toLocaleString("en-IN");

}



function formatLabel(key){

    return String(key)
        .replaceAll("_"," ")
        .replace(/\b\w/g,char => char.toUpperCase());

}



function formatValue(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    if(typeof value === "object"){

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


/* =========================================
   IMAGE
========================================= */


function productImage(
    product,
    className
){

    const image =
        product?.image_url || "";


    if(!image){

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


        if(
            className ===
            "product-image"
        ){

            return `
                <div class="product-no-image">
                    No image
                </div>
            `;

        }


        if(
            className ===
            "modal-product-image"
        ){

            return `
                <div class="modal-product-no-image">
                    No image
                </div>
            `;

        }

    }


    return `
        <img
            class="${escapeHtml(className)}"
            src="${escapeHtml(image)}"
            alt="${escapeHtml(
                product?.name ||
                "Product"
            )}"
            loading="lazy"
        >
    `;

}


/* =========================================
   VARIANT GROUPING
========================================= */


/*
 * Products with the same
 * retailer_product_group_id
 * belong to the same variant group.
 *
 * If the field is missing, the product
 * becomes its own group.
 */


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


    /*
     * Standalone products get a unique
     * internal group ID.
     */

    return `single:${product?.id || Math.random()}`;

}



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


        groups.get(groupId).push(product);

    });


    return groups;

}



function getVariantsForProduct(
    product
){

    const groupId =
        getGroupId(product);


    const groups =
        buildVariantGroups();


    return groups.get(groupId) || [product];

}



/*
 * Returns true only when this product
 * actually has siblings.
 */

function hasVariants(product){

    return (
        getVariantsForProduct(product)
            .length > 1
    );

}

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


/* =========================================
   TILE VIEW
========================================= */


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


        const variants =
            getVariantsForProduct(product);


        const image =
            productImage(
                product,
                "product-card-image"
            );


        const variantBadge =
            variants.length > 1
            ?
            `
            <div class="variant-badge">

                Variant

                <span class="variant-count">

                    ${variants.length}
                    options

                </span>

            </div>
            `
            :
            "";


        const price =
            product.price !== undefined &&
            product.price !== null &&
            product.price !== ""
            ?
            formatPrice(
                product.price,
                product.currency
            )
            :
            "";


        const salePrice =
            product.sale_price !== undefined &&
            product.sale_price !== null &&
            product.sale_price !== ""
            ?
            formatPrice(
                product.sale_price,
                product.currency
            )
            :
            "";


        const displayPrice =
            salePrice
                ? salePrice
                : price;


        card.innerHTML = `

            ${image}

            <div class="product-card-body">

                <div class="product-card-name">

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </div>


                ${
                    variantBadge
                }


                <div class="product-card-description">

                    ${escapeHtml(
                        product.description ||
                        ""
                    )}

                </div>


                <div class="product-card-footer">

                    <div class="product-card-price">

                        

                            ${productPriceHtml(
                                product
                            )}

                        

                    </div>


                    ${
                        product.availability
                        ?
                        `
                        <div class="
                            product-card-availability
                        ">

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


/* =========================================
   LIST VIEW
========================================= */


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


        const variants =
            getVariantsForProduct(product);


        const variantBadge =
            variants.length > 1
            ?
            `
            <div class="variant-badge">

                Variant

                <span class="variant-count">

                    ${variants.length}
                    options

                </span>

            </div>
            `
            :
            "";


        const price =
            product.price !== undefined &&
            product.price !== null &&
            product.price !== ""
            ?
            formatPrice(
                product.price,
                product.currency
            )
            :
            "";


        const salePrice =
            product.sale_price !== undefined &&
            product.sale_price !== null &&
            product.sale_price !== ""
            ?
            formatPrice(
                product.sale_price,
                product.currency
            )
            :
            "";


        const displayPrice =
            salePrice
                ? salePrice
                : price;


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


                ${variantBadge}

            </td>


            <td>

                <div class="product-description">

                    ${escapeHtml(
                        product.description ||
                        ""
                    )}

                </div>

            </td>


            <td>

                <div class="price">

                    

                            ${productPriceHtml(
                                product
                            )}

                        

                </div>

            </td>


            <td>

                <div class="availability">

                    ${escapeHtml(
                        product.availability ||
                        ""
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


/* =========================================
   RENDER BOTH VIEWS
========================================= */


function renderProducts(items){

    renderTiles(items);

    renderList(items);

}


/* =========================================
   VIEW SWITCHING
========================================= */


function setView(view){

    currentView =
        view;


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


/* =========================================
   MODAL DETAIL ITEM
========================================= */


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


/* =========================================
   VARIANT SELECTOR
========================================= */


function renderVariantSection(
    product
){

    const variants =
        getVariantsForProduct(product);


    /*
     * Don't show a variant section for
     * products that don't have siblings.
     */

    if(variants.length <= 1){

        return "";

    }


    const variantHtml =
        variants
            .map(variant => {

                const selected =
                    String(
                        variant.id
                    ) === String(
                        product.id
                    );


                const image =
                    variant.image_url
                    ?
                    `
                    <img
                        class="variant-option-image"
                        src="${escapeHtml(
                            variant.image_url
                        )}"
                        alt="${escapeHtml(
                            variant.name ||
                            "Variant"
                        )}"
                        loading="lazy"
                    >
                    `
                    :
                    `
                    <div class="
                        variant-option-no-image
                    ">

                        No image

                    </div>
                    `;


                const salePrice =
                    variant.sale_price !== undefined &&
                    variant.sale_price !== null &&
                    variant.sale_price !== ""
                    ?
                    formatPrice(
                        variant.sale_price,
                        variant.currency
                    )
                    :
                    "";


                const normalPrice =
                    variant.price !== undefined &&
                    variant.price !== null &&
                    variant.price !== ""
                    ?
                    formatPrice(
                        variant.price,
                        variant.currency
                    )
                    :
                    "";


                const price =
                    salePrice ||
                    normalPrice;


                return `

                    <button
                        type="button"
                        class="
                            variant-option
                            ${selected ? "selected" : ""}
                        "
                        data-variant-id="${escapeHtml(
                            variant.id
                        )}">

                        ${image}


                        <div class="
                            variant-option-body
                        ">

                            <div class="
                                variant-option-name
                            ">

                                ${escapeHtml(
                                    variant.name ||
                                    "Unnamed Variant"
                                )}

                            </div>


                            <div class="
                                variant-option-price
                            ">

                                

                            ${productPriceHtml(
                                variant
                            )}

                        

                            </div>


                            ${
                                selected
                                ?
                                `
                                <div class="
                                    variant-option-selected
                                ">

                                    Selected

                                </div>
                                `
                                :
                                ""
                            }

                        </div>

                    </button>

                `;

            })
            .join("");


    return `

        <div class="variants-section">

            <h3 class="
                variants-section-title
            ">

                Variants

            </h3>


            <div class="variant-list">

                ${variantHtml}

            </div>

        </div>

    `;

}


/* =========================================
   OPEN MODAL
========================================= */


function openProductModal(
    product
){

    const image =
        productImage(
            product,
            "modal-product-image"
        );


    const salePrice =
        product.sale_price !== undefined &&
        product.sale_price !== null &&
        product.sale_price !== ""
        ?
        formatPrice(
            product.sale_price,
            product.currency
        )
        :
        "";


    const normalPrice =
        product.price !== undefined &&
        product.price !== null &&
        product.price !== ""
        ?
        formatPrice(
            product.price,
            product.currency
        )
        :
        "";


    const displayPrice =
        salePrice ||
        normalPrice;


    /*
     * Product header
     */

    const header = `

        <div class="modal-product-header">

            <div class="
                modal-product-image-wrap
            ">

                ${image}

            </div>


            <div class="
                modal-product-summary
            ">

                <h2
                    id="modalProductName"
                    class="modal-product-name">

                    ${escapeHtml(
                        product.name ||
                        "Unnamed Product"
                    )}

                </h2>


                ${
                    displayPrice
                    ?
                    `
                    <div class="
                        modal-product-price
                    ">

                        

                            ${productPriceHtml(
                                product
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
                    <div class="
                        modal-product-availability
                    ">

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
     * Variant section
     */

    const variantsSection =
        renderVariantSection(
            product
        );


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
            "Product Group",
            product.retailer_product_group_id
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


    const basicSection =
        basic
        ?
        `

        <div class="details-section">

            <h3 class="
                details-section-title
            ">

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

            <h3 class="
                details-section-title
            ">

                Description

            </h3>


            <p class="
                description-text
            ">

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
            "Currency",
            product.currency
        ),

        detailItem(
            "Sale Price Effective Date",
            formatDate(
                product.sale_price_effective_date
            )
        )

    ].join("");


    const pricingSection =
        pricing
        ?
        `

        <div class="details-section">

            <h3 class="
                details-section-title
            ">

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
     * Product URL
     */

    const urlSection =
        product.url
        ?
        `

        <div class="details-section">

            <h3 class="
                details-section-title
            ">

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
     * Automatically display unknown
     * fields returned by Meta.
     */

    const knownFields = [

        "id",
        "retailer_id",
        "retailer_product_group_id",
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
            .filter(
                ([key,value]) => {

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

                }
            );


    let extraSection = "";


    if(extraFields.length){

        const extraHtml =
            extraFields
                .map(
                    ([key,value]) => {

                        return `

                            <div class="
                                extra-field
                            ">

                                <div class="
                                    extra-field-label
                                ">

                                    ${escapeHtml(
                                        formatLabel(key)
                                    )}

                                </div>


                                <div class="
                                    extra-field-value
                                ">

                                    ${escapeHtml(
                                        formatValue(value)
                                    )}

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


        extraSection = `

            <div class="
                details-section
            ">

                <h3 class="
                    details-section-title
                ">

                    Additional Catalog Information

                </h3>


                <div class="
                    extra-fields-grid
                ">

                    ${extraHtml}

                </div>

            </div>

        `;

    }


    /*
     * Put everything together.
     */

    productDetails.innerHTML =

        header +

        variantsSection +

        descriptionSection +

        basicSection +

        pricingSection +

        urlSection +

        extraSection;


    /*
     * Attach variant click handlers.
     */

    const variantButtons =
        productDetails.querySelectorAll(
            ".variant-option"
        );


    variantButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


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


    /*
     * Show modal.
     */

    productModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   CLOSE MODAL
========================================= */


function closeProductModal(){

    productModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


/* =========================================
   SEARCH
========================================= */


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


            if(typeof value === "object"){

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

        renderProducts(
            products
        );


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


    renderProducts(
        filtered
    );


    showMessage(
        `${filtered.length} product(s) found`
    );

}


/* =========================================
   LOAD PRODUCTS
========================================= */


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
            Array.isArray(
                data.products
            )
            ?
            data.products
            :
            [];


        renderProducts(
            products
        );


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


/* =========================================
   EVENTS
========================================= */


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

            renderProducts(
                products
            );


            showMessage(
                `${products.length} catalog product(s)`
            );

        }

    }
);


tileViewBtn.addEventListener(
    "click",
    () => {

        setView("tiles");

    }
);


listViewBtn.addEventListener(
    "click",
    () => {

        setView("list");

    }
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


/* =========================================
   START
========================================= */


setView(
    currentView
);


loadProducts();
