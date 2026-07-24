CREATE TABLE whatsapp_messages (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_id INTEGER NOT NULL,

    direction TEXT DEFAULT 'outgoing',

    template_name TEXT,

    whatsapp_message_id TEXT,

    message_type TEXT DEFAULT 'template',

    status TEXT DEFAULT 'pending',

    message_text TEXT,

    sent_at DATETIME,

    delivered_at DATETIME,

    read_at DATETIME,

    failed_reason TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE whatsapp_sessions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_id INTEGER UNIQUE NOT NULL,

    last_customer_message DATETIME,

    window_active INTEGER DEFAULT 0,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE whatsapp_quick_replies (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    button_id TEXT UNIQUE NOT NULL,

    reply_message TEXT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);

ALTER TABLE customers
ADD COLUMN whatsapp_language TEXT DEFAULT 'en';

ALTER TABLE whatsapp_sessions
ADD COLUMN language TEXT DEFAULT 'en';

ALTER TABLE whatsapp_quick_replies
ADD COLUMN language TEXT DEFAULT 'en';

CREATE TABLE whatsapp_incoming_messages (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_id INTEGER,

    whatsapp_message_id TEXT,

    message_type TEXT,

    message_text TEXT,

    button_id TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);
