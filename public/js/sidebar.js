export async function loadSidebar(activePage){

    const container =
    document.getElementById(
        "sidebarContainer"
    );


    if(!container){

        console.error(
            "sidebarContainer not found"
        );

        return;

    }


    const response =
    await fetch(
        "../components/sidebar.html"
    );


    const html =
    await response.text();


    container.innerHTML =
    html;



    const activeLink =
    container.querySelector(
        `[data-page="${activePage}"]`
    );


    if(activeLink){

        activeLink.classList.add(
            "active"
        );

    }


    const logoutBtn =
    document.getElementById(
        "sidebarLogout"
    );


    if(logoutBtn){

        logoutBtn.onclick =
        () => {

            localStorage.clear();

            window.location.href =
            "login.html";

        };

    }

}
