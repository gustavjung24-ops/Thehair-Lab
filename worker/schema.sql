CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_name TEXT,
  contact_name TEXT,
  phone_zalo TEXT NOT NULL,
  area TEXT,
  product_interest TEXT,
  landing_page_sample TEXT,
  note TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
