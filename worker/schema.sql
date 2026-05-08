PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS salons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  salon_name TEXT NOT NULL,
  phone TEXT,
  zalo_url TEXT,
  facebook_url TEXT,
  address TEXT,
  working_hours TEXT,
  logo_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#8b5cf6',
  google_sheet_url TEXT,
  google_sheet_id TEXT,
  google_sheet_tab TEXT DEFAULT 'appointments',
  telegram_chat_id TEXT,
  admin_email TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER,
  salon_slug TEXT,
  salon_name TEXT,
  contact_name TEXT,
  phone_zalo TEXT NOT NULL,
  area TEXT,
  product_interest TEXT,
  landing_page_sample TEXT,
  note TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS salon_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT,
  price_min REAL,
  price_max REAL,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL,
  lead_id INTEGER,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_note TEXT,
  service_name TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  booking_time TEXT,
  appointment_status TEXT NOT NULL DEFAULT 'pending' CHECK (appointment_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'salon_admin' CHECK (role IN ('super_admin', 'salon_admin', 'editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);
CREATE INDEX IF NOT EXISTS idx_salons_status ON salons(status);
CREATE INDEX IF NOT EXISTS idx_leads_salon_id ON leads(salon_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON salon_services(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_time ON appointments(booking_time);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_salon_id ON admin_users(salon_id);
