CREATE TABLE broadcast_history (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    message TEXT NOT NULL,

    total_customers INTEGER DEFAULT 0,

    sent_count INTEGER DEFAULT 0,

    failed_count INTEGER DEFAULT 0,

    status TEXT DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);
