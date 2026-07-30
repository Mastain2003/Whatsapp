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

        const result = await apiFetch("/templates");

        if(!result.success){

            alert(result.message);
            return;

        }

        renderTemplateList(result.templates);

    }
    catch(error){

        console.error(error);

    }

}
