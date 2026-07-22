const ACCESS_TOKEN = "EAASZB1cCOVccBSG85WcYQyQkAfaenVLGl1qS1EEJRwuYqZBicvFV0cZAdkP4iN2DrjKIVVp41otLzSkF0q8vzXxgnz3XN1l8Ee86ZAvyhLENbMso1hNX8vlaZBYYtzhXmpyWEL6nS0ARJYcp3BEZCt68OrqoiVeXtr2O7Fr2K4QfstZANK2Nj7P5Dgh9dlwGrbDIseE7ZAQYxEZAhBgIZCQW7M7E8Nx7qqZCgBlSIveJTYxYuQQd7qZAm0ZB5rhGaXDQIAVY65XuqDrTYCg1ZB6GqR9rLfcFBrSQZDZD";
const PHONE_NUMBER_ID = "1169100286293064";
alert("hi");

async function sendMessage() {

    const response = await fetch(
        `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: "919955160127",
                type: "template",
                template: {
                    name: "independence_day_offer",
                    language: {
                        code: "en"
                    },
                    components: [
                          {
        "type": "header",
        "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://whatsapp.mastain.in/images.jpeg"
            }
          }
        ]
      },
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: "Prakhar Mastain"
                                },
                                {
                                    type: "text",
                                    text: "Marketing Incharge"
                                },
                                {
                                    type: "text",
                                    text: "Milk Plant Ratlam"
                                },
                                {
                                    type: "text",
                                    text: "Ratlam"
                                },
                                {
                                    type: "text",
                                    text: "+91-9955160127"
                                }
                            ]
                        }
                    ]
                }
            })
        }
    );

    const data = await response.json();

    document.getElementById("result").textContent =
        JSON.stringify(data, null, 2);
}
