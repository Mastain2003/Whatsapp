import { apiFetch } from "./core.js";
import { loadSidebar } from "./sidebar.js";

loadSidebar("broadcast");

const customerList = document.getElementById("customerList");
const searchCustomer = document.getElementById("searchCustomer");
const cityFilter = document.getElementById("cityFilter");
const departmentFilter = document.getElementById("departmentFilter");
const selectedCount = document.getElementById("selectedCount");
const messageInput = document.getElementById("message");
const previewText = document.getElementById("previewText");

let customers = [];
let filteredCustomers = [];

async function loadCustomers() {
    const response = await apiFetch("/customers");

    if (!response || !response.success) {
        customerList.innerHTML = "Unable to load customers";
        return;
    }

    customers = response.customers || [];
    filteredCustomers = [...customers];

    createFilters();
    renderCustomers();
}

function createFilters() {
    const cities = [...new Set(customers.map(c => c.city).filter(Boolean))];
    cities.forEach(city => {
        cityFilter.innerHTML += `<option value="${city}">${city}</option>`;
    });

    const departments = [...new Set(customers.map(c => c.department).filter(Boolean))];
    departments.forEach(department => {
        departmentFilter.innerHTML += `<option value="${department}">${department}</option>`;
    });
}

function renderCustomers() {
    customerList.innerHTML = "";

    if (filteredCustomers.length === 0) {
        customerList.innerHTML = "<div style='padding: 10px; color: #666;'>No matching customers found</div>";
        updateCount();
        return;
    }

    filteredCustomers.forEach(customer => {
        const div = document.createElement("div");
        div.className = "customer-item";
        div.style.padding = "6px 0";
        div.style.borderBottom = "1px solid #f0f0f0";

        div.innerHTML = `
            <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="customer-check" value="${customer.id}">
                <span>
                    <div class="customer-name" style="font-weight: bold;">${customer.name}</div>
                    <div class="customer-details" style="font-size: 12px; color: #666;">
                        ${customer.phone || ""} ${customer.city ? "• " + customer.city : ""} ${customer.department ? "• " + customer.department : ""}
                    </div>
                </span>
            </label>
        `;

        customerList.appendChild(div);
    });

    updateCount();
}

function applyFilter() {
    const search = searchCustomer.value.toLowerCase();
    const city = cityFilter.value;
    const department = departmentFilter.value;

    filteredCustomers = customers.filter(customer => {
        const matchesSearch = !search ||
            customer.name.toLowerCase().includes(search) ||
            (customer.phone || "").includes(search);

        const matchesCity = !city || customer.city === city;
        const matchesDepartment = !department || customer.department === department;

        return matchesSearch && matchesCity && matchesDepartment;
    });

    renderCustomers();
}

function updateCount() {
    const selected = document.querySelectorAll(".customer-check:checked").length;
    selectedCount.innerHTML = `Selected: ${selected}`;
}

// Live Preview Update Handler
function updateLivePreview() {
    let rawText = messageInput.value;

    if (!rawText.trim()) {
        previewText.textContent = "Type a message to see live preview...";
        return;
    }

    // Substitute variable tags with preview data
    let formattedText = rawText
        .replace(/\{\{name\}\}/gi, "John Doe")
        .replace(/\{\{post\}\}/gi, "Manager")
        .replace(/\{\{department\}\}/gi, "Operations")
        .replace(/\{\{city\}\}/gi, "Mumbai");

    previewText.textContent = formattedText;
}

// Attach Cursor-Aware Variable Tag Insertion
document.querySelectorAll(".var-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const tag = btn.getAttribute("data-var");
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const val = messageInput.value;

        messageInput.value = val.substring(0, start) + tag + val.substring(end);
        messageInput.selectionStart = messageInput.selectionEnd = start + tag.length;
        messageInput.focus();

        updateLivePreview();
    });
});

// Event Listeners
messageInput.addEventListener("input", updateLivePreview);

document.addEventListener("change", function (event) {
    if (event.target.classList.contains("customer-check")) {
        updateCount();
    }
});

searchCustomer.addEventListener("input", applyFilter);
cityFilter.addEventListener("change", applyFilter);
departmentFilter.addEventListener("change", applyFilter);

document.getElementById("selectAll").onclick = function () {
    document.querySelectorAll(".customer-check").forEach(checkbox => {
        checkbox.checked = true;
    });
    updateCount();
};

document.getElementById("clearAll").onclick = function () {
    document.querySelectorAll(".customer-check").forEach(checkbox => {
        checkbox.checked = false;
    });
    updateCount();
};

document.getElementById("sendBroadcast").onclick = async function () {
    const selected = Array.from(document.querySelectorAll(".customer-check:checked")).map(item => item.value);
    const message = messageInput.value;
    const resultDiv = document.getElementById("result");

    if (selected.length === 0) {
        resultDiv.style.color = "red";
        resultDiv.innerHTML = "Select customers first";
        return;
    }

    if (!message.trim()) {
        resultDiv.style.color = "red";
        resultDiv.innerHTML = "Enter message";
        return;
    }

    resultDiv.style.color = "#333";
    resultDiv.innerHTML = "Sending broadcast...";

    const response = await apiFetch("/broadcast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customers: selected,
            message: message
        })
    });

    if (response && response.success) {
        resultDiv.style.color = "green";
        resultDiv.innerHTML = `Broadcast queued successfully! Sent: ${response.sent || 0}, Failed/Opted-out: ${response.failed || 0}`;
    } else {
        resultDiv.style.color = "red";
        resultDiv.innerHTML = response?.message || "Broadcast failed";
    }
};

loadCustomers();
