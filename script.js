const ACCESS_TOKEN ="EAAX2i6ZCTGxYBSF9ALxkP9rN9lBdZAOIFAp5x4a0QijbLWniZAhgplHvcI4KCPEg2UhmTTvYm2lmDkXW1Vp24Sy2YXf0od8neaD9ZA5VP8qjb7DXl1GkGuiDZCuV5KlKtjkLClY8nWSbyJbGEtZAfNEXQ6Ac6kfCBxc1CimBKucJPwMeI4a24lSEnWabEorYnNnH45p2UIuSY4c0UTXpEK7JdhnojBwkKS6FZCR8gWXpjoQravyvOZAo25csqUOGkGoB85ZBckX3uDWTDXx9DbAgBrzFk";
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
