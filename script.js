const ACCESS_TOKEN "EAAX2i6ZCTGxYBSCwBPDTOJEvs7fzXyKYBeZBQgAoZChToBtR8b8luCkHuO0RXqoJhU4ZAIy3kBJT71OrZANoCE8RbqZCxWV4yvF5lhEmPij5aUMoQc1NwToQhItLZB1dSgtiQhRBzitjf4BndnErS9crWUZCID1UzY9tspa6bXnO2ZAiWMO35GEJ5KVqYPylKvdL6f3CDP8G2RI3pN2Kc6xgW4nTDPbRMlodeUZAlNZC7W9jWqPA7OcHpZCNrDBFOO3lvK4QvMjZBA3WZAjcPrDWz7BFapYmRe";
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
