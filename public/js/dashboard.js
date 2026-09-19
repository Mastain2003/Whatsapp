import {
    requireLogin,
    apiFetch
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";

requireLogin();

loadSidebar("dashboard");

loadDashboard();

async function loadDashboard(){

    const result =
    await apiFetch(
        "/dashboard"
    );

    if(
        !result ||
        !result.success
    ){
        return;
    }

    document.getElementById(
        "customerCount"
    ).innerText =
    result.dashboard.customers;

    document.getElementById(
        "productCount"
    ).innerText =
    result.dashboard.products;

    document.getElementById(
        "messageCount"
    ).innerText =
    result.dashboard.messages;

    document.getElementById(
        "broadcastCount"
    ).innerText =
    result.dashboard.broadcasts;

}
