CREATE TABLE IF NOT EXISTS products (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    product_code TEXT UNIQUE NOT NULL,

    name TEXT NOT NULL,

    category TEXT,

    brand TEXT,

    unit TEXT,

    price REAL DEFAULT 0,

    image_url TEXT,

    description TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);
