import {
    requireLogin,
    logout
} from "./core.js";
import { loadSidebar } from "./sidebar.js";

requireLogin();
loadSidebar("dashboard");


document
.getElementById(
    "logoutBtn"
)
.onclick =
logout;
