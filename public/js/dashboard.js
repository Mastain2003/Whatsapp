import {
    requireLogin,
    logout
} from "./core.js";


requireLogin();


document
.getElementById(
    "logoutBtn"
)
.onclick =
logout;
