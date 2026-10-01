import { jsonResponse } from "./cors_helper.js";
import { checkAuth } from "./auth_service.js";

export async function handleProducts(request, env) {
    const user = await checkAuth(request, env);

    if (!user) {
        return jsonResponse(
            { success: false, message: "Unauthorized" },
            401
        );
    }

    if (request.method !== "GET") {
        return jsonResponse(
            { success: false, message: "Only GET is allowed for catalog products" },
            405
        );
    }

    return getCatalogProducts(request, env);
}

async function getCatalogProducts(request, env) {
    const url = new URL(request.url);
    const after = url.searchParams.get("after");
    const version = env.META_GRAPH_API_VERSION || "v26.0";

    // Fallback if environment variables are missing
    if (!env.META_ACCESS_TOKEN || !env.META_CATALOG_ID || version === "vXX.X") {
        return await getLocalProductsFallback(env);
    }

    const graphUrl = new URL(
        `https://graph.facebook.com/${version}/${env.META_CATALOG_ID}/products`
    );

    graphUrl.searchParams.set(
        "fields",
        [
            "id",
            "retailer_id",
            "retailer_product_group_id",
            "name",
            "description",
            "price",
            "currency",
            "image_url",
            "availability",
            "brand",
            "condition",
            "url",
            "sale_price",
            "sale_price_effective_date"
        ].join(",")
    );

    graphUrl.searchParams.set("limit", "100");
    if (after) graphUrl.searchParams.set("after", after);
    graphUrl.searchParams.set("access_token", env.META_ACCESS_TOKEN);

    try {
        const response = await fetch(graphUrl.toString());
        const data = await response.json();

        if (!response.ok) {
            console.error("Meta Catalog API error:", data);
            return await getLocalProductsFallback(env);
        }

        const products = Array.isArray(data.data) ? data.data : [];

        // Batch Sync into Cloudflare D1
        if (products.length > 0) {
            const insertStmt = env.DB.prepare(`
                INSERT INTO products (
                    id,
                    retailer_id,
                    retailer_product_group_id,
                    name,
                    description,
                    price,
                    currency,
                    image_url,
                    availability,
                    brand,
                    condition,
                    url,
                    sale_price,
                    sale_price_effective_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    retailer_id = excluded.retailer_id,
                    retailer_product_group_id = excluded.retailer_product_group_id,
                    name = excluded.name,
                    description = excluded.description,
                    price = excluded.price,
                    currency = excluded.currency,
                    image_url = excluded.image_url,
                    availability = excluded.availability,
                    brand = excluded.brand,
                    condition = excluded.condition,
                    url = excluded.url,
                    sale_price = excluded.sale_price,
                    sale_price_effective_date = excluded.sale_price_effective_date,
                    updated_at = CURRENT_TIMESTAMP
            `);

            const batchStatements = products.map((item) => {
                // Sanitize string/numeric values from Meta
                const cleanPrice = typeof item.price === "string" ? parseFloat(item.price.replace(/[^0-9.]/g, "")) : (item.price || 0);
                const cleanSalePrice = typeof item.sale_price === "string" ? parseFloat(item.sale_price.replace(/[^0-9.]/g, "")) : (item.sale_price || null);

                return insertStmt.bind(
                    item.id,
                    item.retailer_id || item.id,
                    item.retailer_product_group_id || null,
                    item.name || 'Product',
                    item.description || '',
                    isNaN(cleanPrice) ? 0 : cleanPrice,
                    item.currency || 'INR',
                    item.image_url || '',
                    item.availability || 'in stock',
                    item.brand || '',
                    item.condition || 'new',
                    item.url || '',
                    isNaN(cleanSalePrice) ? null : cleanSalePrice,
                    item.sale_price_effective_date || null
                );
            });

            // Run batch transaction concurrently
            await env.DB.batch(batchStatements);
        }

        return jsonResponse({
            success: true,
            products,
            paging: {
                has_next: Boolean(data.paging?.cursors?.after),
                cursors: {
                    before: data.paging?.cursors?.before || null,
                    after: data.paging?.cursors?.after || null
                }
            }
        });
    } catch (error) {
        console.error("Meta Catalog request failed:", error);
        return await getLocalProductsFallback(env);
    }
}

// Fallback Helper: Fetch products from local D1 database
async function getLocalProductsFallback(env) {
    try {
        const result = await env.DB.prepare(`SELECT * FROM products ORDER BY id DESC`).all();
        return jsonResponse({
            success: true,
            products: result.results || [],
            paging: {
                has_next: false,
                cursors: { before: null, after: null }
            }
        });
    } catch (err) {
        return jsonResponse(
            {
                success: false,
                products: [],
                message: "Failed to fetch local catalog products"
            },
            500
        );
    }
}
