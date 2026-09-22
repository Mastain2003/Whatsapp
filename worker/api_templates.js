import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

const GRAPH_API_VERSION = "v23.0";

function normalizePhone(phone) {
    return String(phone || "").replace(/[^\d]/g, "");
}

function isValidLanguageCode(language) {
    return typeof language === "string" && /^[a-z]{2,3}(?:[_-][A-Z]{2})?$/.test(language);
}

function cleanComponentsFinal(components) {
    if (!Array.isArray(components)) {
        return [];
    }

    return components
        .filter(component => component && typeof component === "object")
        .map(component => {
            const cleaned = {
                type: component.type
            };

            // Preserve button-specific top-level properties required by Meta
            if (component.sub_type !== undefined) {
                cleaned.sub_type = component.sub_type;
            }

            if (component.index !== undefined) {
                cleaned.index = String(component.index);
            }

            if (Array.isArray(component.parameters) && component.parameters.length) {
                cleaned.parameters = component.parameters
                    .filter(parameter => parameter && typeof parameter === "object")
                    .map(parameter => {
                        const result = {
                            type: parameter.type
                        };

                        if (parameter.text !== undefined) {
                            result.text = String(parameter.text);
                        }

                        if (parameter.image) {
                            result.image = parameter.image;
                        }

                        if (parameter.video) {
                            result.video = parameter.video;
                        }

                        if (parameter.document) {
                            result.document = parameter.document;
                        }

                        if (parameter.currency) {
                            result.currency = parameter.currency;
                        }

                        if (parameter.date_time) {
                            result.date_time = parameter.date_time;
                        }

                        // Preserves CATALOG and MPM button action parameters
                        if (parameter.action) {
                            result.action = parameter.action;
                        }

                        // Preserves COPY_CODE button parameters
                        if (parameter.coupon_code !== undefined) {
                            result.coupon_code = String(parameter.coupon_code);
                        }

                        // Preserves QUICK_REPLY button parameters
                        if (parameter.payload !== undefined) {
                            result.payload = String(parameter.payload);
                        }

                        return result;
                    });
            }

            return cleaned;
        })
        .filter(component =>
            component.type &&
            (
                !component.parameters ||
                component.parameters.length > 0
            )
        );
}


function cleanComponents(components) {
    if (!Array.isArray(components)) {
        return [];
    }

    return components
        .filter(component => component && typeof component === "object")
        .map(component => {
            const cleaned = {
                type: component.type
            };

            if (Array.isArray(component.parameters) && component.parameters.length) {
                cleaned.parameters = component.parameters
                    .filter(parameter => parameter && typeof parameter === "object")
                    .map(parameter => {
                        const result = {
                            type: parameter.type
                        };

                        if (parameter.text !== undefined) {
                            result.text = String(parameter.text);
                        }

                        if (parameter.image) {
                            result.image = parameter.image;
                        }

                        if (parameter.video) {
                            result.video = parameter.video;
                        }

                        if (parameter.document) {
                            result.document = parameter.document;
                        }

                        if (parameter.currency) {
                            result.currency = parameter.currency;
                        }

                        if (parameter.date_time) {
                            result.date_time = parameter.date_time;
                        }

                        return result;
                    });
            }

            return cleaned;
        })
        .filter(component =>
            component.type &&
            (
                !component.parameters ||
                component.parameters.length > 0
            )
        );
}

async function getGraphError(response) {
    try {
        return await response.json();
    } catch {
        return {
            message: `Meta API returned HTTP ${response.status}`
        };
    }
}

export async function handleTemplates(request, env) {

    const authorized = await checkAuth(request, env);

    if (!authorized) {
        return jsonResponse({
            success: false,
            message: "Unauthorized"
        }, 401);
    }

    if (request.method !== "GET") {
        return jsonResponse({
            success: false,
            message: "Method not allowed"
        }, 405);
    }

    if (!env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
        return jsonResponse({
            success: false,
            message: "WHATSAPP_BUSINESS_ACCOUNT_ID is not configured"
        }, 500);
    }

    if (!env.WHATSAPP_SEND_TOKEN) {
        return jsonResponse({
            success: false,
            message: "WHATSAPP_SEND_TOKEN is not configured"
        }, 500);
    }

    try {
        const url =
            `https://graph.facebook.com/${GRAPH_API_VERSION}/` +
            `${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${env.WHATSAPP_SEND_TOKEN}`
            }
        });

        if (!response.ok) {
            const error = await getGraphError(response);

            return jsonResponse({
                success: false,
                message: "Meta API Error",
                error
            }, response.status);
        }

        const result = await response.json();

        return jsonResponse({
            success: true,
            templates: result.data || [],
            paging: result.paging || null
        });

    } catch (error) {
        console.error("Get templates error:", error);

        return jsonResponse({
            success: false,
            message: error.message || "Unable to load templates"
        }, 500);
    }
}

export async function handleSendTemplate(request, env) {

    const authorized = await checkAuth(request, env);

    if (!authorized) {
        return jsonResponse({
            success: false,
            message: "Unauthorized"
        }, 401);
    }

    if (request.method !== "POST") {
        return jsonResponse({
            success: false,
            message: "Method not allowed"
        }, 405);
    }

    if (!env.PHONE_NUMBER_ID) {
        return jsonResponse({
            success: false,
            message: "PHONE_NUMBER_ID is not configured"
        }, 500);
    }

    if (!env.WHATSAPP_SEND_TOKEN) {
        return jsonResponse({
            success: false,
            message: "WHATSAPP_SEND_TOKEN is not configured"
        }, 500);
    }

    try {
        const body = await request.json();

        const phone = normalizePhone(body.phone);
        const templateName = String(body.template || "").trim();
        const language = String(body.language || "").trim();

        if (!phone) {
            return jsonResponse({
                success: false,
                message: "Phone number is required"
            }, 400);
        }

        if (!/^\d{8,15}$/.test(phone)) {
            return jsonResponse({
                success: false,
                message: "Invalid WhatsApp phone number"
            }, 400);
        }

        if (!templateName) {
            return jsonResponse({
                success: false,
                message: "Template name is required"
            }, 400);
        }

        if (!/^[a-zA-Z0-9_]+$/.test(templateName)) {
            return jsonResponse({
                success: false,
                message: "Invalid template name"
            }, 400);
        }

        if (!isValidLanguageCode(language)) {
            return jsonResponse({
                success: false,
                message: "Valid template language code is required"
            }, 400);
        }

        const components = cleanComponentsFinal(body.components);

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: language
                }
            }
        };

        if (components.length > 0) {
            payload.template.components = components;
        }

        console.log("Sending WhatsApp template:", {
            to: phone,
            template: templateName,
            language,
            componentCount: components.length
        });

        const response = await fetch(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/` +
            `${env.PHONE_NUMBER_ID}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${env.WHATSAPP_SEND_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = response.ok
            ? await response.json()
            : await getGraphError(response);

        if (!response.ok) {
            console.error("Meta send template error:", result);

            return jsonResponse({
                success: false,
                message:
                    result?.error?.message ||
                    result?.message ||
                    "Meta API Error",
                error: result
            }, response.status);
        }

        const messageId =
            result?.messages?.[0]?.id || null;

        return jsonResponse({
            success: true,
            messageId,
            result
        });

    } catch (error) {
        console.error("Send template error:", error);

        return jsonResponse({
            success: false,
            message: error.message || "Unable to send template"
        }, 500);
    }
}

