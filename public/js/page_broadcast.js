import { apiFetch } from "./core.js";
import { loadSidebar } from "./sidebar.js";

loadSidebar("broadcast");

// DOM Elements
const customerList = document.getElementById("customerList");
const searchCustomer = document.getElementById("searchCustomer");
const cityFilter = document.getElementById("cityFilter");
const windowFilter = document.getElementById("windowFilter");
const activityFilter = document.getElementById("activityFilter");
const orderFilter = document.getElementById("orderFilter");
const selectedCount = document.getElementById("selectedCount");

const messageBody = document.getElementById("messageBody");
const mediaUrl = document.getElementById("mediaUrl");
const mediaGroup = document.getElementById("mediaGroup");
const buttonsGroup = document.getElementById("buttonsGroup");
const buttonsContainer = document.getElementById("buttonsContainer");
const templateSelectionGroup = document.getElementById("templateSelectionGroup");
const templateSelect = document.getElementById("templateSelect");

// Preview DOM Elements
const previewText = document.getElementById("previewText");
const previewMedia = document.getElementById("previewMedia");
const previewButtons = document.getElementById("previewButtons");

let customers = [];
let filteredCustomers = [];
let currentMessageType = "INTERACTIVE"; // INTERACTIVE | MEDIA | TEMPLATE

// 1. Fetch Initial Customer & Filter Data
async function loadCustomers() {
    const response = await apiFetch("/customers");

    if (!response || !response.success) {
        customerList.innerHTML = "<div style='color:red;'>Unable to load customers</div>";
        return;
    }

    customers = response.customers || [];
    filteredCustomers = [...customers];

    populateCityFilter();
    renderCustomers();
    loadTemplates();
}

function populateCityFilter() {
    const cities = [...new Set(customers.map(c => c.city).filter(Boolean))];
    cities.forEach(city => {
        cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
    });
}

// Load WhatsApp HSM Approved Templates
async function loadTemplates() {
    const res = await apiFetch("/whatsapp/templates");
    if (res && res.success && Array.isArray(res.templates)) {
        res.templates.forEach(tpl => {
            templateSelect.innerHTML += `<option value="${tpl.name}" data-body="${tpl.body}">${tpl.name} (${tpl.language})</option>`;
        });
    }
}

// 2. Filter Algorithm (24h Window, Order Status, Activity, City, Search)
function applyFilters() {
    const search = searchCustomer.value.toLowerCase();
    const city = cityFilter.value;
    const sessionWin = windowFilter.value;
    const activity = activityFilter.value;
    const orderStatus = orderFilter.value;

    const now = Date.now();

    filteredCustomers = customers.filter(c => {
        // Search matching
        const matchesSearch = !search ||
            (c.name || "").toLowerCase().includes(search) ||
            (c.phone || "").includes(search) ||
            (c.department || "").toLowerCase().includes(search);

        // City matching
        const matchesCity = !city || c.city === city;

        // 24-Hour Session Window matching
        let matchesWindow = true;
        if (sessionWin === "active") matchesWindow = c.window_active === 1;
        if (sessionWin === "expired") matchesWindow = c.window_active !== 1;

        // Activity matching
        let matchesActivity = true;
        if (c.last_message_timestamp) {
            const daysSince = (now - new Date(c.last_message_timestamp).getTime()) / (1000 * 3600 * 24);
            if (activity === "recent") matchesActivity = daysSince <= 7;
            if (activity === "inactive_30") matchesActivity = daysSince > 30;
        } else if (activity === "never") {
            matchesActivity = true;
        } else if (activity) {
            matchesActivity = false;
        }

        // Order history matching
        let matchesOrders = true;
        if (orderStatus === "has_orders") matchesOrders = Number(c.total_orders || 0) > 0;
        if (orderStatus === "no_orders") matchesOrders = Number(c.total_orders || 0) === 0;
        if (orderStatus === "abandoned_cart") matchesOrders = c.cart_status === "abandoned";

        return matchesSearch && matchesCity && matchesWindow && matchesActivity && matchesOrders;
    });

    renderCustomers();
}

function renderCustomers() {
    customerList.innerHTML = "";

    if (filteredCustomers.length === 0) {
        customerList.innerHTML = "<div style='padding:8px; color:#666;'>No matching recipients found</div>";
        updateCount();
        return;
    }

    filteredCustomers.forEach(c => {
        const div = document.createElement("div");
        div.style.padding = "6px 0";
        div.style.borderBottom = "1px solid #eee";

        const windowBadge = c.window_active === 1 
            ? `<span style="background:#d4edda; color:#155724; font-size:10px; padding:2px 5px; border-radius:4px;">24h Free</span>`
            : `<span style="background:#f8d7da; color:#721c24; font-size:10px; padding:2px 5px; border-radius:4px;">Template Required</span>`;

        div.innerHTML = `
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" class="customer-check" value="${c.id}">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:13px;">${c.name} ${windowBadge}</div>
                    <div style="font-size:11px; color:#666;">${c.phone || ""} | ${c.city || "No City"} | Orders: ${c.total_orders || 0}</div>
                </div>
            </label>
        `;
        customerList.appendChild(div);
    });

    updateCount();
}

function updateCount() {
    const count = document.querySelectorAll(".customer-check:checked").length;
    selectedCount.textContent = `Selected: ${count} Recipients`;
}

// 3. Dynamic Live WhatsApp Preview Updater
function updatePreview() {
    let rawText = messageBody.value;

    // Substitute sample variable replacement data
    let formattedText = rawText
        .replace(/\{\{name\}\}/gi, "John Doe")
        .replace(/\{\{city\}\}/gi, "Mumbai")
        .replace(/\{\{department\}\}/gi, "Operations");

    previewText.textContent = formattedText || "Type a message to preview...";

    // Handle Media Preview
    if (currentMessageType === "MEDIA" && mediaUrl.value.trim()) {
        previewMedia.src = mediaUrl.value.trim();
        previewMedia.style.display = "block";
    } else {
        previewMedia.style.display = "none";
    }

    // Handle Quick Reply Buttons Preview
    previewButtons.innerHTML = "";
    if (currentMessageType !== "TEMPLATE") {
        const buttonInputs = document.querySelectorAll(".reply-btn-input");
        buttonInputs.forEach(input => {
            if (input.value.trim()) {
                const btnDiv = document.createElement("div");
                btnDiv.className = "wa-action-btn";
                btnDiv.textContent = input.value.trim();
                previewButtons.appendChild(btnDiv);
            }
        });
    }
}

// Switch Message Types (INTERACTIVE vs MEDIA vs TEMPLATE)
document.querySelectorAll(".type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentMessageType = btn.getAttribute("data-type");

        // Toggle UI sections
        mediaGroup.style.display = currentMessageType === "MEDIA" ? "block" : "none";
        templateSelectionGroup.style.display = currentMessageType === "TEMPLATE" ? "block" : "none";
        
        // Disable custom reply buttons for templates
        if (currentMessageType === "TEMPLATE") {
            buttonsGroup.style.display = "none";
        } else {
            buttonsGroup.style.display = "block";
        }

        updatePreview();
    });
});

// Template selection handler
templateSelect.addEventListener("change", () => {
    const selectedOption = templateSelect.options[templateSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.body) {
        messageBody.value = selectedOption.dataset.body;
        updatePreview();
    }
});

// Insert dynamic variable pill
document.querySelectorAll(".var-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const tag = btn.getAttribute("data-var");
        const start = messageBody.selectionStart;
        const end = messageBody.selectionEnd;
        const val = messageBody.value;

        messageBody.value = val.substring(0, start) + tag + val.substring(end);
        messageBody.selectionStart = messageBody.selectionEnd = start + tag.length;
        messageBody.focus();

        updatePreview();
    });
});

// Add custom reply button inputs
document.getElementById("addButtonRow").addEventListener("click", () => {
    const inputs = document.querySelectorAll(".reply-btn-input");
    if (inputs.length >= 3) {
        alert("WhatsApp limit: Maximum 3 interactive quick reply buttons allowed.");
        return;
    }

    const div = document.createElement("div");
    div.className = "button-input-row";
    div.innerHTML = `
        <input type="text" class="form-control reply-btn-input" placeholder="Button ${inputs.length + 1}">
    `;
    buttonsContainer.appendChild(div);

    div.querySelector("input").addEventListener("input", updatePreview);
});

// Event Bindings
messageBody.addEventListener("input", updatePreview);
mediaUrl.addEventListener("input", updatePreview);
document.querySelectorAll(".reply-btn-input").forEach(i => i.addEventListener("input", updatePreview));

[searchCustomer, cityFilter, windowFilter, activityFilter, orderFilter].forEach(el => {
    el.addEventListener("change", applyFilters);
    el.addEventListener("input", applyFilters);
});

document.addEventListener("change", e => {
    if (e.target.classList.contains("customer-check")) updateCount();
});

document.getElementById("selectAll").onclick = () => {
    document.querySelectorAll(".customer-check").forEach(cb => cb.checked = true);
    updateCount();
};

document.getElementById("clearAll").onclick = () => {
    document.querySelectorAll(".customer-check").forEach(cb => cb.checked = false);
    updateCount();
};

// Dispatch Broadcast Execution
document.getElementById("sendBroadcast").onclick = async () => {
    const selected = Array.from(document.querySelectorAll(".customer-check:checked")).map(cb => cb.value);
    const resultDiv = document.getElementById("result");

    if (selected.length === 0) {
        resultDiv.style.color = "red";
        resultDiv.textContent = "Please select at least one customer!";
        return;
    }

    if (!messageBody.value.trim()) {
        resultDiv.style.color = "red";
        resultDiv.textContent = "Message body cannot be empty!";
        return;
    }

    // Collect Interactive Buttons
    const buttons = [];
    if (currentMessageType !== "TEMPLATE") {
        document.querySelectorAll(".reply-btn-input").forEach(input => {
            if (input.value.trim()) buttons.push(input.value.trim());
        });
    }

    const payload = {
        customers: selected,
        message_type: currentMessageType,
        message: messageBody.value,
        media_url: currentMessageType === "MEDIA" ? mediaUrl.value.trim() : null,
        template_name: currentMessageType === "TEMPLATE" ? templateSelect.value : null,
        buttons: buttons
    };

    resultDiv.style.color = "#333";
    resultDiv.textContent = "Dispatching broadcast...";

    const res = await apiFetch("/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (res && res.success) {
        resultDiv.style.color = "green";
        resultDiv.textContent = `Broadcast sent successfully! Sent: ${res.sent || 0}, Failed: ${res.failed || 0}`;
    } else {
        resultDiv.style.color = "red";
        resultDiv.textContent = res?.message || "Failed to send broadcast.";
    }
};

loadCustomers();
