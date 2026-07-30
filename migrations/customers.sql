CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_code TEXT UNIQUE NOT NULL, 
  name TEXT NOT NULL, 
  designation TEXT, 
  department TEXT, 
  city TEXT, 
  block TEXT,
  phone TEXT UNIQUE NOT NULL,
  whatsapp_language TEXT DEFAULT "en_IN",
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
