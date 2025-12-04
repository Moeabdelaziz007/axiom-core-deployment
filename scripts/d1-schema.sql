-- ============================================
-- 🗄️ D1 Schema for Axiom RESET Function Calling
-- Create these tables in your D1 database
-- ============================================
-- 📦 Orders (Sofra - Restaurant)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    store_id TEXT,
    items TEXT NOT NULL,
    total REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
-- 🏠 Bookings (Tajer - Real Estate)
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    property_type TEXT,
    location TEXT,
    budget TEXT,
    preferred_date TEXT,
    customer_phone TEXT,
    status TEXT DEFAULT 'pending',
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
-- ⚙️ RFQs (Tirs - Industrial)
CREATE TABLE IF NOT EXISTS rfqs (
    id TEXT PRIMARY KEY,
    part_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    machine_model TEXT,
    urgency TEXT DEFAULT 'normal',
    specs TEXT,
    status TEXT DEFAULT 'open',
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
-- 📚 Sessions (Ostaz - Education)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    subject TEXT,
    grade_level TEXT,
    preferred_time TEXT,
    session_type TEXT DEFAULT 'online',
    student_name TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
-- 💊 Medicine Inventory (Dr. Moe - Pharmacy)
CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL,
    requires_prescription BOOLEAN DEFAULT 0,
    last_updated INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
-- ============================================
-- 🔍 Verification Query
-- Run this to check tables exist
-- ============================================
SELECT name
FROM sqlite_master
WHERE type = 'table';
-- Expected: orders, bookings, rfqs, sessions, medicines