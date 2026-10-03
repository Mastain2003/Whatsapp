import { apiFetch } from "./core.js";
import { loadSidebar } from "./sidebar.js";

// Load layout sidebar
loadSidebar("broadcast");

// Audience & Selection Elements
const customerList = document.getElementById("customerList");
const searchCustomer = document.getElementById("searchCustomer");
const cityFilter = document.getElementById("cityFilter");
const departmentFilter = document.getElementById("departmentFilter");
const windowFilter = document.getElementById("windowFilter");
const activityFilter = document.getElementById("activityFilter");
const orderFilter = document.getElementById("orderFilter");
const selectedCount = document.getElementById("selectedCount");
const selectAllBtn = document.getElementById("selectAll");
const clearAllBtn = document.getElementById("clearAll");

// Message Composer Elements
const typeBtns = document.querySelectorAll(".type-btn");
const templateSelectionGroup = document.getElementById("templateSelectionGroup");
const templateSelect = document.getElementById("templateSelect");
const mediaGroup = document.getElementById("mediaGroup");
const mediaUrlInput = document.getElementById("mediaUrl");
const messageBody = document.getElementById("messageBody") || document.getElementById("message");
const buttonsGroup = document.getElementById("buttonsGroup");
const buttonsContainer = document.getElementById("buttonsContainer");
const addButtonRow = document.getElementById("addButtonRow");
const sendBroadcastBtn = document.getElementById("sendBroadcast");
const resultDiv = document.getElementById("result");

// Preview Elements
const previewMedia = document.getElementById("previewMedia");
const previewText = document.getElementById("previewText");
const previewButtons = document.getElementById("previewButtons");

// State
let customers = [];
let filteredCustomers = [];
let messageType = "INTERACTIVE"; // INTERACTIVE, MEDIA, TEMPLATE

// Initialize
init();

async function init() {
    bindEvents();
    await loadCustomers();
    await loadTemplates();
    updatePreview();
}

// Fetch Customers using apiFetch
async function loadCustomers() {
    const response = await apiFetch("/customers");

    if (!response || !response.success || !Array.isArray(response.customers)) {
        if (customerList) {
            customerList.innerHTML = `<div style="color: red; padding: 10px;">Unable to load customers</div>`;
        }
        return;
    }

    customers = response.customers;
    filteredCustomers = [...customers];

    populateFilters();
    renderCustomers();
}

// Populate Filter Options
function populateFilters() {
    if (cityFilter) {
        const cities = [...new Set(customers.map(c => c.city).filter(Boolean))].sort();
        cityFilter.innerHTML = `<option value="">All Cities</option>`;
        cities.forEach(city => {
            cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }

    if (departmentFilter) {
        const departments = [...new Set(customers.map(c => c.department).filter(Boolean))].sort();
        departmentFilter.innerHTML = `<option value="">All Departments</option>`;
        departments.forEach(dept => {
            departmentFilter.innerHTML += `<option value="${dept}">${dept}</option>`;
        });
    }
}

// Render Customer List
function renderCustomers() {
    if (!customerList) return;

    if (filteredCustomers.length === 0) {
        customerList.innerHTML = `<div style="text-align: center; color: #666; padding: 10px;">No customers found.</div>`;
        updateCount();
        return;
    }

    customerList.innerHTML = filteredCustomers.map(c => {
        const statusTag = c.window_active 
            ? `<span style="background: #e8fadf; color: #075e54; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 4px;">24h Active</span>` 
            : `<span style="background: #eee; color: #777; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 4px;">Expired</span>`;

        return `
            <div class="customer-item" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; width: 100%;">
                    <input type="checkbox" class="customer-check" value="${c.id}">
                    <div>
                        <div class="customer-name"><strong>${c.name || "Customer"}</strong> ${statusTag}</div>
                        <div class="customer-details" style="font-size: 11px; color: #666;">
                            ${c.phone || ""} ${c.city ? "| " + c.city : ""} ${c.department ? "| " + c.department : ""}
                        </div>
                    </div>
                </label>
            </div>
        `;
    }).join("");

    updateCount();
}

// Apply Filters
function applyFilter() {
    const search = searchCustomer ? searchCustomer.value.toLowerCase().trim() : "";
    const city = cityFilter ? cityFilter.value : "";
    const department = departmentFilter ? departmentFilter.value : "";
    const win = windowFilter ? windowFilter.value : "";
    const act = activityFilter ? activityFilter.value : "";
    const ord = orderFilter ? orderFilter.value : "";

    const now = new Date();

    filteredCustomers = customers.filter(c => {
        // Search Filter
        const matchesSearch = !search || 
            (c.name || "").toLowerCase().includes(search) || 
            (c.phone || "").includes(search);

        // City & Dept Filter
        const matchesCity = !city || c.city === city;
        const matchesDept = !department || c.department === department;

        // 24h Window
        if (win === "active" && !c.window_active) return false;
        if (win === "expired" && c.window_active) return false;

        // Activity Tiers
        if (act) {
            const lastActive = c.last_interaction ? new Date(c.last_interaction) : null;
            const daysDiff = lastActive ? (now - lastActive) / (1000 * 3600 * 24) : 999;

            if (act === "recent" && (daysDiff > 7 || !lastActive)) return false;
            if (act === "inactive_30" && daysDiff <= 30) return false;
            if (act === "never" && lastActive) return false;
        }

        // Orders
        if (ord === "has_orders" && (!c.order_count || c.order_count === 0)) return false;
        if (ord === "no_orders" && c.order_count > 0) return false;

        return matchesSearch && matchesCity && matchesDept;
    });

    renderCustomers();
}

// Update Selected Counter
function updateCount() {
    if (!selectedCount) return;
    const selected = document.querySelectorAll(".customer-check:checked").length;
    selectedCount.innerHTML = `Selected: ${selected}`;
}

// Load WhatsApp Templates
async function loadTemplates() {
    if (!templateSelect) return;
    try {
        const response = await apiFetch("/templates");
        if (response && response.success && Array.isArray(response.templates)) {
            templateSelect.innerHTML = `<option value="">-- Select Template --</option>`;
            response.templates.forEach(t => {
                templateSelect.innerHTML += `<option value="${t.name}">${t.name}</option>`;
            });
        }
    } catch (err) {
        console.error("Error loading templates:", err);
    }
}

// Event Bindings
function bindEvents() {
    if (searchCustomer) searchCustomer.addEventListener("input", applyFilter);
    if (cityFilter) cityFilter.addEventListener("change", applyFilter);
    if (departmentFilter) departmentFilter.addEventListener("change", applyFilter);
    if (windowFilter) windowFilter.addEventListener("change", applyFilter);
    if (activityFilter) activityFilter.addEventListener("change", applyFilter);
    if (orderFilter) orderFilter.addEventListener("change", applyFilter);

    // Dynamic checkbox counter handler
    document.addEventListener("change", function(event) {
        if (event.target.classList.contains("customer-check")) {
            updateCount();
        }
    });

    if (selectAllBtn) {
        selectAllBtn.onclick = function() {
            document.querySelectorAll(".customer-check").forEach(chk => chk.checked = true);
            updateCount();
        };
    }

    if (clearAllBtn) {
        clearAllBtn.onclick = function() {
            document.querySelectorAll(".customer-check").forEach(chk => chk.checked = false);
            updateCount();
        };
    }

    // Toggle Message Type Tabs
    typeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            typeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            messageType = btn.dataset.type;

            if (buttonsGroup) buttonsGroup.classList.toggle("is-hidden", messageType !== "INTERACTIVE");
            if (mediaGroup) mediaGroup.classList.toggle("is-hidden", messageType !== "MEDIA");
            if (templateSelectionGroup) templateSelectionGroup.classList.toggle("is-hidden", messageType !== "TEMPLATE");

            updatePreview();
        });
    });

    if (messageBody) messageBody.addEventListener("input", updatePreview);
    if (mediaUrlInput) mediaUrlInput.addEventListener("input", updatePreview);
    if (buttonsContainer) buttonsContainer.addEventListener("input", updatePreview);

    // Add Interactive Button Row
    if (addButtonRow && buttonsContainer) {
        addButtonRow.addEventListener("click", () => {
            const currentInputs = buttonsContainer.querySelectorAll(".reply-btn-input");
            if (currentInputs.length >= 3) {
                alert("Maximum 3 quick reply buttons allowed.");
                return;
            }

            const div = document.createElement("div");
            div.className = "button-input-row";
            div.innerHTML = `<input type="text" class="form-control reply-btn-input" placeholder="Button ${currentInputs.length + 1}" value="Option ${currentInputs.length + 1}">`;
            buttonsContainer.appendChild(div);

            div.querySelector("input").addEventListener("input", updatePreview);
            updatePreview();
        });
    }

    // Personalization Insert Tags
    document.querySelectorAll(".var-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!messageBody) return;
            const tag = btn.dataset.var;
            const start = messageBody.selectionStart || 0;
            const end = messageBody.selectionEnd || 0;
            const val = messageBody.value;

            messageBody.value = val.substring(0, start) + tag + val.substring(end);
            messageBody.focus();
            messageBody.selectionStart = messageBody.selectionEnd = start + tag.length;

            updatePreview();
        });
    });

    if (sendBroadcastBtn) sendBroadcastBtn.onclick = sendBroadcast;
}

// Live Phone Preview Renderer
function updatePreview() {
    if (previewText && messageBody) {
        previewText.textContent = messageBody.value.trim() || "Type a message to preview...";
    }

    if (previewMedia && mediaUrlInput) {
        if (messageType === "MEDIA" && mediaUrlInput.value.trim()) {
            previewMedia.src = mediaUrlInput.value.trim();
            previewMedia.style.display = "block";
        } else {
            previewMedia.style.display = "none";
            previewMedia.src = "";
        }
    }

    if (previewButtons && buttonsContainer) {
        if (messageType === "INTERACTIVE") {
            const inputs = buttonsContainer.querySelectorAll(".reply-btn-input");
            previewButtons.innerHTML = "";
            let count = 0;

            inputs.forEach(input => {
                const text = input.value.trim();
                if (text) {
                    count++;
                    const btn = document.createElement("div");
                    btn.className = "wa-action-btn";
                    btn.textContent = text;
                    previewButtons.appendChild(btn);
                }
            });

            previewButtons.style.display = count > 0 ? "flex" : "none";
        } else {
            previewButtons.style.display = "none";
            previewButtons.innerHTML = "";
        }
    }
}

// Send Broadcast Action
async function sendBroadcast() {
    const selected = Array.from(document.querySelectorAll(".customer-check:checked")).map(item => item.value);
    const message = messageBody ? messageBody.value.trim() : "";

    if (selected.length === 0) {
        if (resultDiv) resultDiv.innerHTML = "Select customers first";
        return;
    }

    if (messageType !== "TEMPLATE" && !message) {
        if (resultDiv) resultDiv.innerHTML = "Enter message";
        return;
    }

    const buttonLabels = [];
    if (messageType === "INTERACTIVE" && buttonsContainer) {
        buttonsContainer.querySelectorAll(".reply-btn-input").forEach(i => {
            if (i.value.trim()) buttonLabels.push(i.value.trim());
        });
    }

    const payload = {
        customers: selected,
        message_type: messageType,
        message: message,
        media_url: mediaUrlInput ? mediaUrlInput.value.trim() : null,
        template_name: templateSelect ? templateSelect.value : null,
        buttons: buttonLabels
    };

    if (resultDiv) resultDiv.innerHTML = "Sending broadcast...";

    const response = await apiFetch("/broadcast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (resultDiv) {
        resultDiv.innerHTML = (response && response.message) ? response.message : "Broadcast processed";
    }
}
