-- Initialize database tables for QR Code Check-in Application

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table for customer information
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table for student information
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session types table for different tutoring sessions
CREATE TABLE IF NOT EXISTS session_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  quickbooks_item_id TEXT,
  price REAL,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR codes table for customer QR codes
CREATE TABLE IF NOT EXISTS qr_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER UNIQUE REFERENCES customers(id),
  code_value TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins table for recording student check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(id),
  session_type_id INTEGER REFERENCES session_types(id),
  staff_id INTEGER REFERENCES users(id),
  check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  quickbooks_invoice_id TEXT,
  quickbooks_sync_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default session types
INSERT INTO session_types (name, description, price, duration_minutes)
VALUES 
  ('French/Math Tutoring', 'French or mathematics tutoring session', 45.00, 60),
  ('Music Session', 'Music instruction session', 50.00, 45);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, first_name, last_name)
VALUES ('admin@example.com', '$2a$10$JwXdETcvJPEr4kFT6xM6aOjPg8zD5/d5hFALG42pKuGr7DXr2EOCO', 'admin', 'Admin', 'User');
