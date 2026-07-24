import {
    logout
} from "./core.js";


export async function loadSidebar(activePage){

    const response =
    await fetch("../components/sidebar.html");


    const html =
    await response.text();


    const holder =
    document.getElementById(
        "sidebarContainer"
    );


    holder.innerHTML =
    html;



    const active =
    holder.querySelector(

        `[data-page="${activePage}"]`

    );


    if(active){

        active.classList.add(
            "active"
        );

    }



    document
    .getElementById(
        "sidebarLogout"
    )
    .onclick =
    logout;

}
