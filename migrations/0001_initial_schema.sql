-- =================================================================
-- BALIK.LAGI - D1 Database Schema Migration
-- =================================================================
-- Version: 1.0
-- Date: 2026-02-01
-- Purpose: Complete database schema migration from Supabase to D1
-- =================================================================

-- =================================================================
-- TABLE 1: user_profiles
-- Purpose: Store user authentication and profile data
-- =================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'capster', 'customer')),
  customer_phone TEXT,
  customer_name TEXT,
  branch_id TEXT,
  access_key_used TEXT,
  is_approved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_customer_phone ON user_profiles(customer_phone);
CREATE INDEX IF NOT EXISTS idx_user_branch_id ON user_profiles(branch_id);

-- =================================================================
-- TABLE 2: sessions
-- Purpose: Store user sessions for authentication
-- =================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON sessions(expires_at);

-- =================================================================
-- TABLE 3: branches
-- Purpose: Store barbershop branch information
-- =================================================================

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  owner_id TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_branch_owner ON branches(owner_id);
CREATE INDEX IF NOT EXISTS idx_branch_active ON branches(is_active);

-- =================================================================
-- TABLE 4: service_catalog
-- Purpose: Store available services for booking
-- =================================================================

CREATE TABLE IF NOT EXISTS service_catalog (
  id TEXT PRIMARY KEY,
  branch_id TEXT,
  service_name TEXT NOT NULL,
  service_tier TEXT NOT NULL CHECK (service_tier IN ('Basic', 'Premium', 'Mastery')),
  price REAL NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_service_branch ON service_catalog(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_tier ON service_catalog(service_tier);
CREATE INDEX IF NOT EXISTS idx_service_active ON service_catalog(is_active);

-- =================================================================
-- TABLE 5: capsters
-- Purpose: Store capster/barber information
-- =================================================================

CREATE TABLE IF NOT EXISTS capsters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  branch_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  specialty TEXT,
  rating REAL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_bookings INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_capster_user ON capsters(user_id);
CREATE INDEX IF NOT EXISTS idx_capster_branch ON capsters(branch_id);
CREATE INDEX IF NOT EXISTS idx_capster_active ON capsters(is_active);

-- =================================================================
-- TABLE 6: bookings
-- Purpose: Store customer booking information
-- =================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_id TEXT,
  branch_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  capster_id TEXT,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  service_tier TEXT NOT NULL CHECK (service_tier IN ('Basic', 'Premium', 'Mastery')),
  requested_capster TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES service_catalog(id) ON DELETE RESTRICT,
  FOREIGN KEY (capster_id) REFERENCES capsters(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_booking_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_branch ON bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_booking_capster ON bookings(capster_id);
CREATE INDEX IF NOT EXISTS idx_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_created ON bookings(created_at);

-- =================================================================
-- TABLE 7: barbershop_transactions
-- Purpose: Store completed transaction data
-- =================================================================

CREATE TABLE IF NOT EXISTS barbershop_transactions (
  id TEXT PRIMARY KEY,
  transaction_date TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_area TEXT,
  branch_id TEXT NOT NULL,
  service_tier TEXT NOT NULL CHECK (service_tier IN ('Basic', 'Premium', 'Mastery')),
  upsell_items TEXT,
  capster_name TEXT,
  capster_id TEXT,
  atv_amount REAL NOT NULL CHECK (atv_amount >= 0),
  discount_amount REAL DEFAULT 0 CHECK (discount_amount >= 0),
  net_revenue REAL GENERATED ALWAYS AS (atv_amount - discount_amount) STORED,
  is_coupon_redeemed INTEGER DEFAULT 0,
  is_google_review_asked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (capster_id) REFERENCES capsters(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_trans_date ON barbershop_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_trans_customer_phone ON barbershop_transactions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_trans_branch ON barbershop_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_trans_capster ON barbershop_transactions(capster_id);
CREATE INDEX IF NOT EXISTS idx_trans_service_tier ON barbershop_transactions(service_tier);
CREATE INDEX IF NOT EXISTS idx_trans_revenue ON barbershop_transactions(net_revenue DESC);

-- =================================================================
-- TABLE 8: barbershop_customers
-- Purpose: Aggregated customer analytics and metrics
-- =================================================================

CREATE TABLE IF NOT EXISTS barbershop_customers (
  customer_phone TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_area TEXT,
  branch_id TEXT NOT NULL,
  total_visits INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  average_atv REAL DEFAULT 0,
  last_visit_date TEXT,
  average_recency_days INTEGER,
  customer_segment TEXT CHECK (customer_segment IN ('New', 'Regular', 'VIP', 'Churned')),
  lifetime_value REAL DEFAULT 0,
  coupon_count INTEGER DEFAULT 0,
  coupon_eligible INTEGER DEFAULT 0,
  google_review_given INTEGER DEFAULT 0,
  next_visit_prediction TEXT,
  churn_risk_score REAL DEFAULT 0 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 1),
  first_visit_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cust_branch ON barbershop_customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_cust_segment ON barbershop_customers(customer_segment);
CREATE INDEX IF NOT EXISTS idx_cust_last_visit ON barbershop_customers(last_visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_cust_lifetime_value ON barbershop_customers(lifetime_value DESC);
CREATE INDEX IF NOT EXISTS idx_cust_churn_risk ON barbershop_customers(churn_risk_score DESC);

-- =================================================================
-- TABLE 9: barbershop_analytics_daily
-- Purpose: Daily aggregated analytics for dashboard
-- =================================================================

CREATE TABLE IF NOT EXISTS barbershop_analytics_daily (
  date TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL,
  total_revenue REAL DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  average_atv REAL DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  total_unique_customers INTEGER DEFAULT 0,
  basic_tier_count INTEGER DEFAULT 0,
  premium_tier_count INTEGER DEFAULT 0,
  mastery_tier_count INTEGER DEFAULT 0,
  upsell_rate REAL DEFAULT 0,
  coupons_redeemed INTEGER DEFAULT 0,
  reviews_requested INTEGER DEFAULT 0,
  khl_target REAL DEFAULT 2500000,
  khl_progress REAL DEFAULT 0,
  month_to_date_revenue REAL DEFAULT 0,
  day_of_week TEXT,
  is_weekend INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON barbershop_analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_branch ON barbershop_analytics_daily(branch_id);

-- =================================================================
-- TABLE 10: barbershop_actionable_leads
-- Purpose: Pre-calculated lead lists for marketing
-- =================================================================

CREATE TABLE IF NOT EXISTS barbershop_actionable_leads (
  id TEXT PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  lead_segment TEXT NOT NULL CHECK (lead_segment IN (
    'high_value_churn',
    'ready_to_visit',
    'coupon_eligible',
    'review_target',
    'new_customer_welcome'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  recommended_action TEXT NOT NULL,
  whatsapp_message_template TEXT,
  days_since_last_visit INTEGER,
  average_atv REAL,
  total_visits INTEGER,
  lifetime_value REAL,
  is_contacted INTEGER DEFAULT 0,
  contacted_at TEXT,
  contact_result TEXT,
  generated_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leads_branch ON barbershop_actionable_leads(branch_id);
CREATE INDEX IF NOT EXISTS idx_leads_segment ON barbershop_actionable_leads(lead_segment);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON barbershop_actionable_leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_contacted ON barbershop_actionable_leads(is_contacted);

-- =================================================================
-- TABLE 11: access_keys
-- Purpose: Store and manage access keys for registration
-- =================================================================

CREATE TABLE IF NOT EXISTS access_keys (
  key_code TEXT PRIMARY KEY,
  key_type TEXT NOT NULL CHECK (key_type IN ('admin', 'capster', 'customer')),
  branch_id TEXT,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT -1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_access_key_type ON access_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_access_key_branch ON access_keys(branch_id);
CREATE INDEX IF NOT EXISTS idx_access_key_active ON access_keys(is_active);

-- =================================================================
-- END OF MIGRATION
-- =================================================================
