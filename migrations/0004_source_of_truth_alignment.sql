-- 1. Add missing fields to customers table
ALTER TABLE customers ADD COLUMN marketing_opt_in INTEGER DEFAULT 1; -- 1 = true, 0 = false (UNSUBSCRIBE)[span_4](start_span)[span_4](end_span)
ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'active'; -- Active / Inactive / Suspended[span_5](start_span)[span_5](end_span)

-- 2. Add missing fields to orders table
ALTER TABLE orders ADD COLUMN confirmation_method TEXT; -- 'PHONE' or 'PHYSICAL_MEETING[span_6](start_span)'[span_6](end_span)
ALTER TABLE orders ADD COLUMN confirmed_by INTEGER; -- Admin user ID[span_7](start_span)[span_7](end_span)
ALTER TABLE orders ADD COLUMN confirmation_message_sent_at DATETIME; -- Timestamp when WhatsApp confirmation was sent[span_8](start_span)[span_8](end_span)
ALTER TABLE orders ADD COLUMN cancelled_by INTEGER; -- Admin user ID[span_9](start_span)[span_9](end_span)
ALTER TABLE orders ADD COLUMN cancellation_reason TEXT; -- Reason for admin/customer cancellation[span_10](start_span)[span_10](end_span)
ALTER TABLE orders ADD COLUMN confirmed_at DATETIME;[span_11](start_span)[span_11](end_span)
ALTER TABLE orders ADD COLUMN cancelled_at DATETIME;[span_12](start_span)[span_12](end_span)

-- 3. Consolidate messages table for persistent conversation history & Inbox
CREATE TABLE IF NOT EXISTS messages_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_id INTEGER,
    whatsapp_message_id TEXT,
    direction TEXT CHECK(direction IN ('INBOUND', 'OUTBOUND')) NOT NULL, -- INBOUND or OUTBOUND[span_13](start_span)[span_13](end_span)
    sender_type TEXT CHECK(sender_type IN ('CUSTOMER', 'SYSTEM', 'ADMIN')) NOT NULL, -- CUSTOMER, SYSTEM, or ADMIN[span_14](start_span)[span_14](end_span)
    message_type TEXT DEFAULT 'TEXT', -- TEXT, IMAGE, VIDEO, DOCUMENT, TEMPLATE, INTERACTIVE, CATALOG, ORDER[span_15](start_span)[span_15](end_span)
    message_text TEXT,
    media_type TEXT,
    media_id TEXT,
    media_url TEXT,
    template_name TEXT,
    button_id TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, READ, FAILED[span_16](start_span)[span_16](end_span)
    sent_at DATETIME,
    delivered_at DATETIME,
    read_at DATETIME,
    failed_at DATETIME,
    error_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 4. Create performance indexes for message lookup & 24-hour window querying
CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages_v2(customer_id);[span_17](start_span)[span_17](end_span)
CREATE INDEX IF NOT EXISTS idx_messages_wa_id ON messages_v2(whatsapp_message_id);[span_18](start_span)[span_18](end_span)
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages_v2(order_id);
