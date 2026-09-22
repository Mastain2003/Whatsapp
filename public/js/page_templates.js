import {
    requireLogin,
    apiFetch
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";

requireLogin();
loadSidebar("templates");

let selectedTemplate = null;

init();

async function init() {
    try {
        const result = await apiFetch("/templates");

        if (!result) {
            return;
        }

        if (!result.success) {
            alert(result.message || "Unable to load templates");
            return;
        }

        window.templates = Array.isArray(result.templates)
            ? result.templates
            : [];

        renderTemplateList(window.templates);

        if (!window.templates.length) {
            showEmptyTemplateState();
        }

    } catch (error) {
        console.error("Template loading error:", error);
        alert("Unable to load WhatsApp templates");
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function showEmptyTemplateState() {
    const list = document.getElementById("templateList");

    if (list) {
        list.innerHTML =
            `<div class="no-templates">Nothing to display</div>`;
    }
}

function renderTemplateList(templates) {
    const list = document.getElementById("templateList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (!Array.isArray(templates) || templates.length === 0) {
        showEmptyTemplateState();
        return;
    }

    templates.forEach(template => {
        const card = document.createElement("div");

        card.className = "template-card";

        card.innerHTML = `
            <div class="template-name">
                ${escapeHtml(template.name)}
            </div>

            <div class="template-info">
                ${escapeHtml(template.category || "")}
                <br>
                ${escapeHtml(template.language || "")}
            </div>

            <div class="template-status">
                ${escapeHtml(template.status || "")}
            </div>
        `;

        card.addEventListener("click", () => {
            document
                .querySelectorAll(".template-card")
                .forEach(c => c.classList.remove("active"));

            card.classList.add("active");

            selectedTemplate = template;
            showTemplate(template);
        });

        list.appendChild(card);
    });
}

function getComponents(template) {
    return Array.isArray(template?.components)
        ? template.components
        : [];
}

function getComponent(template, type) {
    return getComponents(template)
        .find(component => component.type === type);
}

function getBodyVariableCount(template) {
    const body = getComponent(template, "BODY");

    if (!body) {
        return 0;
    }

    const text = body.text || "";

    const matches =
        text.match(/\{\{\s*\d+\s*\}\}/g) || [];

    return matches.length;
}

function getHeaderVariableCount(template) {
    const header = getComponent(template, "HEADER");

    if (!header || header.format !== "TEXT") {
        return 0;
    }

    const text = header.text || "";

    const matches =
        text.match(/\{\{\s*\d+\s*\}\}/g) || [];

    return matches.length;
}

function getVariableExamples(template, componentType) {
    const component = getComponent(template, componentType);

    if (!component?.example) {
        return [];
    }

    if (
        componentType === "BODY" &&
        Array.isArray(component.example.body_text) &&
        Array.isArray(component.example.body_text[0])
    ) {
        return component.example.body_text[0];
    }

    if (
        componentType === "HEADER" &&
        Array.isArray(component.example.header_text)
    ) {
        return component.example.header_text;
    }

    return [];
}

function showTemplate(template) {
    const components = getComponents(template);

    const header = components.find(c => c.type === "HEADER");

    const body = components.find(c => c.type === "BODY");

    const footer = components.find(c => c.type === "FOOTER");

    const buttonsComponent = components.find(c => c.type === "BUTTONS");
    const buttons = buttonsComponent?.buttons || [];

    const bodyVariableCount = getBodyVariableCount(template);

    const headerVariableCount = getHeaderVariableCount(template);

    const bodyExamples = getVariableExamples(template, "BODY");

    const headerExamples = getVariableExamples(template, "HEADER");

    let variablesHtml = "";

    if (headerVariableCount > 0) {
        for (let index = 0; index < headerVariableCount; index++) {
            const value = headerExamples[index] ?? "";

            variablesHtml += `
                <div class="variable">
                    <label>Header {{${index + 1}}}</label>

                    <input
                        class="variable-input header-variable-input"
                        data-component="header"
                        data-index="${index}"
                        value="${escapeAttribute(value)}"
                        placeholder="Enter value">
                </div>
            `;
        }
    }

    if (bodyVariableCount > 0) {
        for (let index = 0; index < bodyVariableCount; index++) {
            const value = bodyExamples[index] ?? "";

            variablesHtml += `
                <div class="variable">
                    <label>Body {{${index + 1}}}</label>

                    <input
                        class="variable-input body-variable-input"
                        data-component="body"
                        data-index="${index}"
                        value="${escapeAttribute(value)}"
                        placeholder="Enter value">
                </div>
            `;
        }
    }

    /* -------------------------------------------------------------
     * Dynamic inputs for URL / Quick Reply / Coupon Code Buttons
     * ------------------------------------------------------------- */
    buttons.forEach((btn, idx) => {
        if (btn.type === "URL" && (btn.url || "").includes("{{1}}")) {
            const exampleValue = btn.example?.[0] || "";
            variablesHtml += `
                <div class="variable">
                    <label>Button #${idx + 1} URL Variable ({{1}})</label>

                    <input
                        class="variable-input button-variable-input"
                        data-component="button"
                        data-type="URL"
                        data-index="${idx}"
                        value="${escapeAttribute(exampleValue)}"
                        placeholder="e.g. order-123">
                </div>
            `;
        } else if (btn.type === "QUICK_REPLY" && (btn.text || "").includes("{{1}}")) {
            variablesHtml += `
                <div class="variable">
                    <label>Button #${idx + 1} Quick Reply Payload</label>

                    <input
                        class="variable-input button-variable-input"
                        data-component="button"
                        data-type="QUICK_REPLY"
                        data-index="${idx}"
                        value="CUSTOM_PAYLOAD_${idx}"
                        placeholder="Enter payload">
                </div>
            `;
        } else if (btn.type === "COPY_CODE") {
            const exampleCode = btn.example?.[0] || "";
            variablesHtml += `
                <div class="variable">
                    <label>Button #${idx + 1} Coupon Code</label>

                    <input
                        class="variable-input button-variable-input"
                        data-component="button"
                        data-type="COPY_CODE"
                        data-index="${idx}"
                        value="${escapeAttribute(exampleCode)}"
                        placeholder="Enter code (e.g. OFFER50)">
                </div>
            `;
        }
    });

    if (!variablesHtml) {
        variablesHtml = "No variables";
    }

    const details = document.getElementById("templateDetails");

    if (!details) {
        return;
    }

    details.innerHTML = `
        <h2>${escapeHtml(template.name)}</h2>

        <div class="section">
            <h4>Information</h4>

            <p>
                <b>Category :</b>
                ${escapeHtml(template.category || "")}
                <br>

                <b>Language :</b>
                ${escapeHtml(template.language || "")}
                <br>

                <b>Status :</b>
                ${escapeHtml(template.status || "")}
            </p>
        </div>

        <div class="section">
            <h4>Header</h4>

            <p>
                ${
                    header
                        ? header.format === "TEXT"
                            ? escapeHtml(header.text || "")
                            : escapeHtml(header.format || "")
                        : "None"
                }
            </p>
        </div>

        <div class="section">
            <h4>Body</h4>

            <pre>${escapeHtml(body?.text || "")}</pre>
        </div>

        <div class="section">
            <h4>Variables</h4>

            ${variablesHtml}
        </div>

        <div class="section">
            <h4>Footer</h4>

            <p>
                ${
                    footer
                        ? escapeHtml(footer.text || "")
                        : "None"
                }
            </p>
        </div>

        <div class="section">
            <h4>Buttons</h4>

            ${
                buttons.length
                    ? `<ul>
                        ${buttons.map(button => `
                            <li>
                                ${escapeHtml(button.type || "")}
                                :
                                ${escapeHtml(button.text || button.url || "")}
                            </li>
                        `).join("")}
                    </ul>`
                    : "<p>No buttons</p>"
            }
        </div>

        <div class="section send-test-section">
            <h4>📱 Send Template</h4>

            <div class="send-test-form">
                <label>WhatsApp Number</label>

                <input
                    type="text"
                    id="testPhone"
                    inputmode="numeric"
                    placeholder="919955160127">

                <button
                    type="button"
                    id="btnSendTemplate"
                    class="btn-send-template">
                    🚀 Send Template
                </button>

                <div
                    id="sendTemplateResult"
                    class="send-result">
                </div>
            </div>
        </div>
    `;

    renderPreview(
        header,
        body,
        footer,
        buttons
    );

    document
        .querySelectorAll(".variable-input")
        .forEach(input => {
            input.addEventListener("input", () => {
                renderPreview(
                    header,
                    body,
                    footer,
                    buttons
                );
            });
        });

    const sendButton = document.getElementById("btnSendTemplate");

    if (sendButton) {
        sendButton.addEventListener(
            "click",
            () => sendTemplate(template)
        );
    }
}

function collectVariables(componentType) {
    return [
        ...document.querySelectorAll(
            `.variable-input[data-component="${componentType}"]`
        )
    ]
        .sort(
            (a, b) =>
                Number(a.dataset.index) -
                Number(b.dataset.index)
        )
        .map(input => ({
            index: Number(input.dataset.index),
            type: input.dataset.type,
            value: input.value.trim()
        }));
}

function renderPreview(
    header,
    body,
    footer,
    buttons
) {
    const preview = document.getElementById("templatePreview");

    if (!preview) {
        return;
    }

    const headerVariables = collectVariables("header").map(v => v.value);
    const bodyVariables = collectVariables("body").map(v => v.value);

    let message = "";

    if (header) {
        if (header.format === "TEXT") {
            let headerText = header.text || "";

            headerVariables.forEach((value, index) => {
                headerText = headerText.replaceAll(
                    `{{${index + 1}}}`,
                    escapeHtml(value)
                );
            });

            message += `
                <div style="font-weight:bold; font-size:16px; margin-bottom:10px;">
                    ${headerText}
                </div>
            `;
        } else if (header.format === "IMAGE") {
            const image = header.example?.header_handle?.[0];
            if (image) {
                message += `
                    <div style="padding:20px; text-align:center; background:#eee; border-radius:8px; margin-bottom:10px;">
                        <img src="${image}" style="width:100%; border-radius:8px; margin-bottom:10px;">
                    </div>
                `;
            }
        } else if (header.format === "VIDEO") {
            message += `
                <div style="padding:20px; text-align:center; background:#eee; border-radius:8px; margin-bottom:10px;">
                    🎥 Video header
                </div>
            `;
        } else if (header.format === "DOCUMENT") {
            message += `
                <div style="padding:20px; text-align:center; background:#eee; border-radius:8px; margin-bottom:10px;">
                    📄 Document header
                </div>
            `;
        }
    }

    if (body) {
        let bodyText = body.text || "";

        bodyVariables.forEach((value, index) => {
            bodyText = bodyText.replaceAll(
                `{{${index + 1}}}`,
                escapeHtml(value)
            );
        });

        message += `
            <div class="message-body">
                ${bodyText.replace(/\n/g, "<br>")}
            </div>
        `;
    }

    if (footer) {
        message += `
            <div class="message-footer">
                ${escapeHtml(footer.text || "")}
            </div>
        `;
    }

    let buttonsHtml = "";

    buttons.forEach(button => {
        let text = button.text || "";
        if (button.type === "CATALOG") text = "View Catalog";
        if (button.type === "MPM") text = "View Items";
        if (button.type === "COPY_CODE") text = `Copy Code: ${button.example?.[0] || 'CODE'}`;

        buttonsHtml += `
            <div class="message-button">
                ${escapeHtml(text)}
            </div>
        `;
    });

    preview.innerHTML = `
        <div class="phone-preview">
            <div class="phone-header">
                WhatsApp
            </div>

            <div class="phone-chat">
                <div class="message">
                    ${message}
                    ${buttonsHtml}
                </div>
            </div>
        </div>
    `;
}

function buildHeaderComponent(template) {
    const header = getComponent(template, "HEADER");

    if (!header) {
        return null;
    }

    if (header.format === "TEXT") {
        const values = collectVariables("header").map(v => v.value);

        if (!values.length) {
            return null;
        }

        return {
            type: "header",
            parameters: values.map(value => ({
                type: "text",
                text: value
            }))
        };
    }

    if (header.format === "IMAGE") {
        return {
            type: "header",
            parameters: [
                {
                    type: "image",
                    image: {
                        "link": "https://whatsapp.mastain.in/img/1784960031243.png"
                    }
                }
            ]
        };
    }

    return null;
}

function buildBodyComponent(template) {
    const body = getComponent(template, "BODY");
    const count = getBodyVariableCount(template);

    if (!body || count === 0) {
        return null;
    }

    const values = collectVariables("body").map(v => v.value);

    if (values.length !== count) {
        throw new Error(`This template requires ${count} body variable(s).`);
    }

    const parameters = values.map(value => ({
        type: "text",
        text: value
    }));

    return {
        type: "body",
        parameters
    };
}

/* -------------------------------------------------------------
 * Universal Button Component Builder
 * Handles CATALOG, URL, QUICK_REPLY, COPY_CODE, and MPM
 * ------------------------------------------------------------- */
function buildButtonComponents(template) {
    const buttonsComponent = getComponent(template, "BUTTONS");

    if (!buttonsComponent || !Array.isArray(buttonsComponent.buttons)) {
        return [];
    }

    const buttonInputs = collectVariables("button");
    const components = [];

    buttonsComponent.buttons.forEach((button, index) => {
        const idxStr = String(index);

        // 1. CATALOG Button
        if (button.type === "CATALOG") {
            const sku = "9n871107qr";// (template.thumbnailProductSku || button.thumbnail_product_retailer_id || "").trim();

            components.push({
                type: "button",
                sub_type: "CATALOG",
                index: 0,
                parameters: [
                    {
                        type: "action",
                        action:{
                            thumbnail_product_retailer_id: "lo2e1m5miz"
                        }
                    }
                ]
            });
        }

        // 2. Dynamic URL Button (Only if it contains {{1}})
        else if (button.type === "URL" && (button.url || "").includes("{{1}}")) {
            const inputObj = buttonInputs.find(i => i.index === index);
            const inputVal = inputObj ? inputObj.value : "";

            components.push({
                type: "button",
                sub_type: "url",
                index: idxStr,
                parameters: [
                    {
                        type: "text",
                        text: inputVal
                    }
                ]
            });
        }

        // 3. COPY CODE / Coupon Button
        else if (button.type === "COPY_CODE") {
            const inputObj = buttonInputs.find(i => i.index === index);
            const inputVal = inputObj ? inputObj.value : (button.example?.[0] || "");

            components.push({
                type: "button",
                sub_type: "copy_code",
                index: idxStr,
                parameters: [
                    {
                        type: "coupon_code",
                        coupon_code: inputVal
                    }
                ]
            });
        }

        // 4. Dynamic Quick Reply (Only if explicit payload required)
        else if (button.type === "QUICK_REPLY" && button.type === "DYNAMIC") {
            const inputObj = buttonInputs.find(i => i.index === index);
            const inputVal = inputObj ? inputObj.value : "PAYLOAD";

            components.push({
                type: "button",
                sub_type: "quick_reply",
                index: idxStr,
                parameters: [
                    {
                        type: "payload",
                        payload: inputVal
                    }
                ]
            });
        }

        // Standard static buttons (PHONE_NUMBER, Static URL, Static Quick Reply) 
        // are intentionally ignored here as required by Meta Cloud API.
    });

    return components;
}


function buildTemplatePayload(template) {
    const components = [];

    const headerComponent = buildHeaderComponent(template);
    if (headerComponent) {
        components.push(headerComponent);
    }

    const bodyComponent = buildBodyComponent(template);
    if (bodyComponent) {
        components.push(bodyComponent);
    }

   const buttonComponents = buildButtonComponents(template);
    if (buttonComponents.length > 0) {
        components.push(...buttonComponents);
    }

    return components;
}

async function sendTemplate(template) {
    const phoneInput = document.getElementById("testPhone");
    const resultBox = document.getElementById("sendTemplateResult");
    const sendButton = document.getElementById("btnSendTemplate");

    if (!phoneInput || !resultBox || !sendButton) {
        return;
    }

    const phone = phoneInput.value.trim().replace(/[^\d]/g, "");

    if (!phone) {
        resultBox.style.color = "red";
        resultBox.innerHTML = "❌ Enter WhatsApp number";
        return;
    }

    if (!/^\d{8,15}$/.test(phone)) {
        resultBox.style.color = "red";
        resultBox.innerHTML = "❌ Enter a valid WhatsApp number with country code";
        return;
    }

    let components;

    try {
        components = buildTemplatePayload(template);
    } catch (error) {
        resultBox.style.color = "red";
        resultBox.innerHTML = `❌ ${escapeHtml(error.message)}`;
        return;
    }

    sendButton.disabled = true;
    sendButton.innerHTML = "Sending...";

    resultBox.style.color = "";
    resultBox.innerHTML = "Sending template...";

    try {
        const result = await apiFetch(
            "/templates/send",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone,
                    template: template.name,
                    language: template.language,
                    components
                })
            }
        );

        console.log("Send template response:", result);

        if (result?.success) {
            resultBox.style.color = "green";
            resultBox.innerHTML =
                `✅ Template sent successfully` +
                (
                    result.messageId
                        ? `<br>Message ID: ${escapeHtml(result.messageId)}`
                        : ""
                );
        } else {
            resultBox.style.color = "red";
            const errorText =
                result?.message ||
                result?.error?.error?.message ||
                result?.error?.message ||
                "Failed to send template";

            resultBox.innerHTML = `❌ ${escapeHtml(errorText)}`;
        }
    } catch (error) {
        console.error("Send template error:", error);

        resultBox.style.color = "red";
        resultBox.innerHTML = `❌ ${escapeHtml(
            error.message || "Unable to send template"
        )}`;
    } finally {
        sendButton.disabled = false;
        sendButton.innerHTML = "🚀 Send Template";
    }
}

