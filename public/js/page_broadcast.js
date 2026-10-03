import { fetchAuth } from "./auth_helper.js";

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements - Selection & Filters
    const windowFilter = document.getElementById("windowFilter");
    const activityFilter = document.getElementById("activityFilter");
    const orderFilter = document.getElementById("orderFilter");
    const cityFilter = document.getElementById("cityFilter");
    const searchCustomer = document.getElementById("searchCustomer");
    const customerList = document.getElementById("customerList");
    const selectedCount = document.getElementById("selectedCount");
    const selectAllBtn = document.getElementById("selectAll");
    const clearAllBtn = document.getElementById("clearAll");

    // DOM Elements - Message Form
    const typeBtns = document.querySelectorAll(".type-btn");
    const templateSelectionGroup = document.getElementById("templateSelectionGroup");
    const templateSelect = document.getElementById("templateSelect");
    const mediaGroup = document.getElementById("mediaGroup");
    const mediaUrlInput = document.getElementById("mediaUrl");
    const messageBody = document.getElementById("messageBody");
    const buttonsGroup = document.getElementById("buttonsGroup");
    const buttonsContainer = document.getElementById("buttonsContainer");
    const addButtonRow = document.getElementById("addButtonRow");
    const sendBroadcastBtn = document.getElementById("sendBroadcast");
    const resultDiv = document.getElementById("result");

    // DOM Elements - Live WhatsApp Preview
    const previewMedia = document.getElementById("previewMedia");
    const previewText = document.getElementById("previewText");
    const previewButtons = document.getElementById("previewButtons");

    // State Variables
    let allCustomers = [];
    let filteredCustomers = [];
    let selectedCustomerIds = new Set();
    let currentMessageType = "INTERACTIVE"; // INTERACTIVE, MEDIA, or TEMPLATE

    // Initialize Page
    init();

    async function init() {
        bindEvents();
        await loadCustomers();
        await loadTemplates();
        updatePreview();
    }

    /* ==========================================================================
       1. DATA FETCHING & FILTERING LOGIC
       ========================================================================== */

    async function loadCustomers() {
        try {
            const res = await fetchAuth("/api/customers");
            const data = await res.json();

            if (data.success && Array.isArray(data.customers)) {
                allCustomers = data.customers;
                populateCityDropdown(allCustomers);
                applyFilters();
            } else {
                customerList.innerHTML = `<div style="color: #ef4444;">Failed to load customers.</div>`;
            }
        } catch (err) {
            console.error("Error loading customers:", err);
            customerList.innerHTML = `<div style="color: #ef4444;">Error fetching customer data.</div>`;
        }
    }

    function populateCityDropdown(customers) {
        const cities = [...new Set(customers.map(c => c.city).filter(Boolean))].sort();
        cityFilter.innerHTML = `<option value="">All Cities</option>`;
        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const winVal = windowFilter.value;
        const actVal = activityFilter.value;
        const ordVal = orderFilter.value;
        const cityVal = cityFilter.value.toLowerCase();
        const searchVal = searchCustomer.value.toLowerCase().trim();

        const now = new Date();

        filteredCustomers = allCustomers.filter(c => {
            // Filter: 24h Window
            if (winVal === "active" && !c.window_active) return false;
            if (winVal === "expired" && c.window_active) return false;

            // Filter: Activity Status
            if (actVal) {
                const lastActive = c.last_interaction ? new Date(c.last_interaction) : null;
                const daysDiff = lastActive ? (now - lastActive) / (1000 * 3600 * 24) : 999;

                if (actVal === "recent" && (daysDiff > 7 || !lastActive)) return false;
                if (actVal === "inactive_30" && daysDiff <= 30) return false;
                if (actVal === "never" && lastActive) return false;
            }

            // Filter: Order Activity
            if (ordVal === "has_orders" && (!c.order_count || c.order_count === 0)) return false;
            if (ordVal === "no_orders" && c.order_count > 0) return false;
            if (ordVal === "abandoned_cart" && !c.has_abandoned_cart) return false;

            // Filter: City
            if (cityVal && (c.city || "").toLowerCase() !== cityVal) return false;

            // Filter: Freeform Search Term
            if (searchVal) {
                const name = (c.name || "").toLowerCase();
                const phone = (c.phone || "").toLowerCase();
                const dept = (c.department || "").toLowerCase();
                if (!name.includes(searchVal) && !phone.includes(searchVal) && !dept.includes(searchVal)) {
                    return false;
                }
            }

            return true;
        });

        renderCustomerList();
    }

    function renderCustomerList() {
        if (filteredCustomers.length === 0) {
            customerList.innerHTML = `<div style="color: #64748b; text-align: center; padding: 10px;">No matching customers found.</div>`;
            return;
        }

        customerList.innerHTML = filteredCustomers.map(c => {
            const isChecked = selectedCustomerIds.has(c.id) ? "checked" : "";
            const windowBadge = c.window_active 
                ? `<span style="background: #dcfce7; color: #15803d; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">24h Active</span>` 
                : `<span style="background: #f1f5f9; color: #64748b; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Expired</span>`;

            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; width: 100%;">
                        <input type="checkbox" class="customer-checkbox" data-id="${c.id}" ${isChecked}>
                        <div>
                            <strong>${escapeHtml(c.name || "Unknown")}</strong> (${escapeHtml(c.phone)}) ${windowBadge}
                            <div style="font-size: 11px; color: #64748b;">${escapeHtml(c.city || "No City")} | ${escapeHtml(c.department || "General")}</div>
                        </div>
                    </label>
                </div>
            `;
        }).join("");

        bindCheckboxEvents();
    }

    function bindCheckboxEvents() {
        customerList.querySelectorAll(".customer-checkbox").forEach(chk => {
            chk.addEventListener("change", (e) => {
                const id = parseInt(e.target.dataset.id, 10);
                if (e.target.checked) {
                    selectedCustomerIds.add(id);
                } else {
                    selectedCustomerIds.delete(id);
                }
                updateSelectedCounter();
            });
        });
    }

    function updateSelectedCounter() {
        selectedCount.textContent = `Selected: ${selectedCustomerIds.size} Recipients`;
    }

    async function loadTemplates() {
        try {
            const res = await fetchAuth("/api/templates");
            const data = await res.json();

            if (data.success && Array.isArray(data.templates)) {
                templateSelect.innerHTML = `<option value="">-- Select Template --</option>`;
                data.templates.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.name;
                    opt.textContent = `${t.name} (${t.category || "APPROVED"})`;
                    templateSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.error("Error loading templates:", err);
        }
    }

    /* ==========================================================================
       2. EVENT BINDING & UI TOGGLES
       ========================================================================== */

    function bindEvents() {
        // Target Filters
        windowFilter.addEventListener("change", applyFilters);
        activityFilter.addEventListener("change", applyFilters);
        orderFilter.addEventListener("change", applyFilters);
        cityFilter.addEventListener("change", applyFilters);
        searchCustomer.addEventListener("input", applyFilters);

        // Selection Handlers
        selectAllBtn.addEventListener("click", () => {
            filteredCustomers.forEach(c => selectedCustomerIds.add(c.id));
            renderCustomerList();
            updateSelectedCounter();
        });

        clearAllBtn.addEventListener("click", () => {
            selectedCustomerIds.clear();
            renderCustomerList();
            updateSelectedCounter();
        });

        // Message Type Toggles
        typeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                typeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentMessageType = btn.dataset.type;

                // Toggle Form Sections
                buttonsGroup.classList.toggle("is-hidden", currentMessageType !== "INTERACTIVE");
                mediaGroup.classList.toggle("is-hidden", currentMessageType !== "MEDIA");
                templateSelectionGroup.classList.toggle("is-hidden", currentMessageType !== "TEMPLATE");

                updatePreview();
            });
        });

        // Input Observers for WhatsApp Live Preview
        messageBody.addEventListener("input", updatePreview);
        mediaUrlInput.addEventListener("input", updatePreview);
        buttonsContainer.addEventListener("input", updatePreview);

        // Add Quick Reply Button Input
        addButtonRow.addEventListener("click", () => {
            const currentInputs = buttonsContainer.querySelectorAll(".reply-btn-input");
            if (currentInputs.length >= 3) {
                alert("WhatsApp limits interactive messages to a maximum of 3 quick reply buttons.");
                return;
            }

            const row = document.createElement("div");
            row.className = "button-input-row";
            row.innerHTML = `<input type="text" class="form-control reply-btn-input" placeholder="Button ${currentInputs.length + 1}" value="Option ${currentInputs.length + 1}">`;
            buttonsContainer.appendChild(row);

            row.querySelector("input").addEventListener("input", updatePreview);
            updatePreview();
        });

        // Variable Insertion Pills
        document.querySelectorAll(".var-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const tag = btn.dataset.var;
                const start = messageBody.selectionStart;
                const end = messageBody.selectionEnd;
                const text = messageBody.value;

                messageBody.value = text.substring(0, start) + tag + text.substring(end);
                messageBody.focus();
                messageBody.selectionStart = messageBody.selectionEnd = start + tag.length;

                updatePreview();
            });
        });

        // Dispatch Broadcast Action
        sendBroadcastBtn.addEventListener("click", handleBroadcastDispatch);
    }

    /* ==========================================================================
       3. LIVE WHATSAPP PHONE PREVIEW
       ========================================================================== */

    function updatePreview() {
        // Text Content Update
        const bodyVal = messageBody.value.trim();
        previewText.textContent = bodyVal || "Type a message to preview...";

        // Media Header Update
        if (currentMessageType === "MEDIA" && mediaUrlInput.value.trim()) {
            previewMedia.src = mediaUrlInput.value.trim();
            previewMedia.style.display = "block";
        } else {
            previewMedia.style.display = "none";
            previewMedia.src = "";
        }

        // Quick Reply Buttons Update
        if (currentMessageType === "INTERACTIVE") {
            const buttonInputs = buttonsContainer.querySelectorAll(".reply-btn-input");
            previewButtons.innerHTML = "";
            let hasButtons = false;

            buttonInputs.forEach(input => {
                const btnVal = input.value.trim();
                if (btnVal) {
                    hasButtons = true;
                    const btnEl = document.createElement("div");
                    btnEl.className = "wa-action-btn";
                    btnEl.textContent = btnVal;
                    previewButtons.appendChild(btnEl);
                }
            });

            previewButtons.style.display = hasButtons ? "flex" : "none";
        } else {
            previewButtons.style.display = "none";
            previewButtons.innerHTML = "";
        }
    }

    /* ==========================================================================
       4. BROADCAST DISPATCH CONTROLLER
       ========================================================================== */

    async function handleBroadcastDispatch() {
        resultDiv.textContent = "";
        resultDiv.style.color = "#333";

        const recipientIds = Array.from(selectedCustomerIds);

        if (recipientIds.length === 0) {
            alert("Please select at least one customer from the list to send the broadcast.");
            return;
        }

        if (currentMessageType !== "TEMPLATE" && !messageBody.value.trim()) {
            alert("Please provide text content for your broadcast message.");
            return;
        }

        // Collect configured quick reply buttons
        const buttonLabels = [];
        if (currentMessageType === "INTERACTIVE") {
            buttonsContainer.querySelectorAll(".reply-btn-input").forEach(inp => {
                if (inp.value.trim()) buttonLabels.push(inp.value.trim());
            });
        }

        const payload = {
            customers: recipientIds,
            message_type: currentMessageType,
            message: messageBody.value.trim(),
            media_url: mediaUrlInput.value.trim() || null,
            template_name: templateSelect.value || null,
            buttons: buttonLabels
        };

        try {
            sendBroadcastBtn.disabled = true;
            sendBroadcastBtn.textContent = "Dispatching Broadcast...";
            resultDiv.textContent = "Sending messages via WhatsApp Cloud API...";

            const res = await fetchAuth("/api/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                resultDiv.style.color = "#16a34a";
                resultDiv.textContent = `✅ Broadcast completed! Sent: ${data.sent}, Failed: ${data.failed}`;
            } else {
                resultDiv.style.color = "#dc2626";
                resultDiv.textContent = `❌ Error: ${data.message || "Broadcast failed"}`;
            }
        } catch (err) {
            console.error("Broadcast dispatch error:", err);
            resultDiv.style.color = "#dc2626";
            resultDiv.textContent = "❌ Network or server failure while sending broadcast.";
        } finally {
            sendBroadcastBtn.disabled = false;
            sendBroadcastBtn.textContent = "Send Broadcast";
        }
    }

    // Helper: Utility to escape HTML to prevent XSS
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
});
