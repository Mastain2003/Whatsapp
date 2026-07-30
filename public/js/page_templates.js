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

        if(!result){

            return;

        }

        if(!result.success){

            alert(
                result.message
            );

            return;

        }

        window.templates =
        result.templates;

        renderTemplateList(
            result.templates
        );

    }

    catch(error){

        console.error(error);

    }

}

function renderTemplateList(
    templates
){

    const list =
    document.getElementById(
        "templateList"
    );

    list.innerHTML = "";

    templates.forEach(

        template=>{

            const card =
            document.createElement(
                "div"
            );

            card.className =
            "template-card";

            card.innerHTML =

            `
            <div class="template-name">

                ${template.name}

            </div>

            <div class="template-info">

                ${template.category}
                <br>

                ${template.language}

            </div>

            <div class="template-status">

                ${template.status}

            </div>
            `;

            card.onclick =
            ()=>{

                document
                .querySelectorAll(
                    ".template-card"
                )
                .forEach(

                    c=>c.classList.remove(
                        "active"
                    )

                );

                card.classList.add(
                    "active"
                );

                showTemplate(
                    template
                );

            };

            list.appendChild(
                card
            );

        }

    );

}

function showTemplate(
    template
){

    console.log(
        template
    );

}
