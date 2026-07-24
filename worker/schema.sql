-- Customer table

CREATE TABLE IF NOT EXISTS customers (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_code TEXT UNIQUE NOT NULL,

    name TEXT NOT NULL,

    designation TEXT,

    department TEXT,

    city TEXT,

    phone TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



-- Index for faster searching

CREATE INDEX IF NOT EXISTS idx_customers_phone
ON customers(phone);



CREATE INDEX IF NOT EXISTS idx_customers_city
ON customers(city);
