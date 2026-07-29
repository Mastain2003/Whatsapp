import {
    requireLogin,
    apiFetch
} from "./core.js";

import {
    loadSidebar
} from "./sidebar.js";

requireLogin();

loadSidebar("templates");

init();

async function init(){

    try{

        const result =
        await apiFetch(
            "/templates"
        );

        console.log(result);

    }
    catch(error){

        console.error(
            "Unable to load templates",
            error
        );

    }

}
