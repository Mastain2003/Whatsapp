const ACCESS_TOKEN ="EAAX2i6ZCTGxYBSLDyspE8SsUvSrM4ZC5ZCSaabqUUiHncOM78tN8ZBJ2IGlpEZCT5uw0VvBgsxYwUMp1GoGlAns67CZBv0e0HwZBpEQXYH2vAmbykucYKMlx4lHENX9wb6D8vIj74Ud0FlvVPo22FmIxndnrSSaVDVm5YNa5XUaGQkTlnKKCeesQkgvrZA1qY8Y3UQGJ77ZBT3xPRLijjK2JlCpPhv0AznlzSwacqdqcyjrAZCZClXLNmc4AT8lY8gZAkvPBGo0L3YuyPYU1TnO2IV9ai7If1QZDZD";
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
