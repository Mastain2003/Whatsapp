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

function showTemplate(template){

    let header = null;
    let body = null;
    let footer = null;
    let buttons = [];

    template.components.forEach(component=>{

        switch(component.type){

            case "HEADER":
                header = component;
                break;

            case "BODY":
                body = component;
                break;

            case "FOOTER":
                footer = component;
                break;

            case "BUTTONS":
                buttons = component.buttons || [];
                break;

        }

    });


    let variablesHtml = "";

    if(

        body &&
        body.example &&
        body.example.body_text

    ){

        body.example.body_text[0].forEach(

            (value,index)=>{

                variablesHtml +=

                `
                <div class="variable">

                    <label>

                        {{${index+1}}}

                    </label>

                    <input
                    class="variable-input"
                    data-index="${index}"
                    value="${value}">

                </div>
                `;

            }

        );

    }


    const details =
    document.getElementById(
        "templateDetails"
    );


    details.innerHTML =

    `
        <h2>

            ${template.name}

        </h2>


        <div class="section">

            <h4>

                Information

            </h4>

            <p>

                <b>Category :</b>

                ${template.category}

                <br>

                <b>Language :</b>

                ${template.language}

                <br>

                <b>Status :</b>

                ${template.status}

            </p>

        </div>


        <div class="section">

            <h4>

                Header

            </h4>

            <p>

            ${
                header

                ?

                header.format==="TEXT"

                ?

                header.text

                :

                header.format

                :

                "None"

            }

            </p>

        </div>


        <div class="section">

            <h4>

                Body

            </h4>

            <pre>

${body ? body.text : ""}

            </pre>

        </div>


        <div class="section">

            <h4>

                Variables

            </h4>

            ${

                variablesHtml ||

                "No variables"

            }

        </div>





        <div class="section">

            <h4>

                Footer

            </h4>

            <p>

            ${

                footer

                ?

                footer.text

                :

                "None"

            }

            </p>

        </div>


        <div class="section">

            <h4>

                Buttons

            </h4>

            <ul>

            ${

                buttons.map(

                    button=>

                    `<li>${button.type} : ${button.text}</li>`

                ).join("")

            }

            </ul>

        </div>

    `;

    <div class="section send-test-section">
    <h4>
        📱 Send Template
    </h4>

    <div class="send-test-form">

        <label>
            WhatsApp Number
        </label>

        <input
            type="text"
            id="testPhone"
            placeholder="919955160127">

        <button
            type="button"
            id="btnSendTemplate"
            class="btn-send-template">
            🚀 Send Template
        </button>

        <div id="sendTemplateResult" class="send-result"></div>

    </div>
</div>

    renderPreview(

        header,

        body,

        footer,

        buttons

    );


    document
    .querySelectorAll(
        ".variable-input"
    )
    .forEach(

        input=>{

            input.addEventListener(

                "input",

                ()=>{

                    renderPreview(

                        header,

                        body,

                        footer,

                        buttons

                    );

                }

            );

        }

    );

    // Send Template button

const sendBtn =
document.getElementById("btnSendTemplate");

if(sendBtn){

    sendBtn.onclick =
    async function(){

        const phone =
        document
        .getElementById("testPhone")
        .value
        .trim()
        .replace(/[^\d]/g,"");

        const resultBox =
        document.getElementById("sendTemplateResult");

        if(!phone){

            resultBox.innerHTML =
            "<span style='color:red'>Enter phone number</span>";

            return;

        }

        // Collect variable values
        const variables = [];

        document
        .querySelectorAll(".variable-input")
        .forEach(input=>{
            variables.push(input.value);
        });

        sendBtn.disabled = true;
        sendBtn.innerHTML = "Sending...";

        try{

            const response =
            await apiFetch(
                "/templates/send",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        phone,
                        template:template.name,
                        language:template.language,
                        variables
                    })
                }
            );

            if(response && response.success){

                resultBox.innerHTML =
                `<span style="color:green">✅ Template sent successfully</span><br>Message ID: ${response.messageId || ""}`;

            }
            else{

                resultBox.innerHTML =
                `<span style="color:red">❌ ${response?.message || "Failed to send template"}</span>`;

            }

        }
        catch(error){

            console.error(error);

            resultBox.innerHTML =
            "<span style='color:red'>❌ Unable to send template</span>";

        }
        finally{

            sendBtn.disabled = false;
            sendBtn.innerHTML = "🚀 Send Template";

        }

    };
}

    const sendButton =
document.getElementById(
    "btnSendTemplate"
);

if(sendButton){

    sendButton.onclick =
    ()=>{

        sendTemplate(
            template
        );

    };

}

}

function renderPreview(

    header,

    body,

    footer,

    buttons

){

    const preview =
    document.getElementById(
        "templatePreview"
    );



    let message = "";



    // HEADER

    if(header){

        if(header.format === "TEXT"){

            message +=
            `
            <div
            style="
            font-weight:bold;
            font-size:16px;
            margin-bottom:10px;
            ">

                ${header.text}

            </div>
            `;

        }

        else if(header.format === "IMAGE"){

            const image =

            header.example
            ?.header_handle
            ?.[0];

            if(image){

                message +=
                `
                <img
                src="${image}"
                style="
                width:100%;
                border-radius:8px;
                margin-bottom:10px;
                ">
                `;

            }

        }

    }



    // VARIABLES

    let variables = [];

    document
    .querySelectorAll(
        ".variable-input"
    )
    .forEach(

        input=>{

            variables.push(

                input.value

            );

        }

    );



    if(

        variables.length === 0 &&

        body &&

        body.example &&

        body.example.body_text

    ){

        variables =

        body.example.body_text[0];

    }



    // BODY

    if(body){

        let bodyText =
        body.text;



        variables.forEach(

            (value,index)=>{

                bodyText =

                bodyText.replaceAll(

                    `{{${index+1}}}`,

                    `${value}`

                );

            }

        );



        message +=

        `
        <div
        class="message-body">

            ${bodyText.replace(/\n/g,"<br>")}

        </div>
        `;

    }



    // FOOTER

    if(footer){

        message +=

        `
        <div
        class="message-footer">

            ${footer.text}

        </div>
        `;

    }



    // BUTTONS

    let buttonsHtml = "";



    buttons.forEach(

        button=>{

            buttonsHtml +=

            `
            <div
            class="message-button">

                ${button.text}

            </div>
            `;

        }

    );



    preview.innerHTML =

    `
    <div class="phone-preview">

        <div class="phone-header">

            WhatsApp

        </div>

        <div class="phone-chat">

            <div class="message">

                ${message}

                ${buttonsHtml}

            </div>

        </div>

    </div>
    `;

}


async function sendTemplate(template){

    const phone =
    document
    .getElementById("testPhone")
    .value
    .trim();

    if(!phone){

        alert(
            "Enter WhatsApp number"
        );

        return;

    }

    let components = [];

    const inputs =
    document.querySelectorAll(
        ".variable-input"
    );

    if(inputs.length){

        components.push({

            type:"body",

            parameters:

            [...inputs].map(

                input=>({

                    type:"text",

                    text:input.value

                })

            )

        });

    }

    const result =
    await apiFetch(

        "/templates/send",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                phone,

                template:
                template.name,

                language:
                template.language,

                components

            })

        }

    );

    const message =
    document.getElementById(
        "sendTemplateResult"
    );

    if(!result){

        return;

    }

    if(result.success){

        message.style.color =
        "green";

        message.innerHTML =
        "✅ Template sent successfully";

    }

    else{

        message.style.color =
        "red";

        message.innerHTML =

        result.message ||

        JSON.stringify(result.error);

    }

}
