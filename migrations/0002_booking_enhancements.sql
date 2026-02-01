-- =================================================================
-- BALIK.LAGI - Booking System Enhancements Migration
-- =================================================================
-- Version: 2.0
-- Date: 2026-02-01
-- Purpose: Add booking_appointments table and coupon tracking
-- =================================================================

-- =================================================================
-- TABLE: booking_appointments (Main Booking Table)
-- Purpose: Complete booking system dengan real-time tracking
-- =================================================================

CREATE TABLE IF NOT EXISTS booking_appointments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price REAL NOT NULL CHECK (service_price >= 0),
  capster_id TEXT,
  capster_name TEXT,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES service_catalog(id) ON DELETE RESTRICT,
  FOREIGN KEY (capster_id) REFERENCES capsters(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_appt_customer ON booking_appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_appt_customer_phone ON booking_appointments(customer_phone);
CREATE INDEX IF NOT EXISTS idx_booking_appt_branch ON booking_appointments(branch_id);
CREATE INDEX IF NOT EXISTS idx_booking_appt_service ON booking_appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_appt_capster ON booking_appointments(capster_id);
CREATE INDEX IF NOT EXISTS idx_booking_appt_date ON booking_appointments(booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_appt_status ON booking_appointments(status);
CREATE INDEX IF NOT EXISTS idx_booking_appt_created ON booking_appointments(created_at);

-- =================================================================
-- TABLE: customer_coupons
-- Purpose: Track customer coupon/loyalty points (4x potong = 1 free)
-- =================================================================

CREATE TABLE IF NOT EXISTS customer_coupons (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  coupon_count INTEGER DEFAULT 0 CHECK (coupon_count >= 0),
  total_visits INTEGER DEFAULT 0,
  last_visit_date TEXT,
  coupon_eligible INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coupon_customer ON customer_coupons(customer_id);
CREATE INDEX IF NOT EXISTS idx_coupon_phone ON customer_coupons(customer_phone);
CREATE INDEX IF NOT EXISTS idx_coupon_branch ON customer_coupons(branch_id);
CREATE INDEX IF NOT EXISTS idx_coupon_eligible ON customer_coupons(coupon_eligible);

-- =================================================================
-- TABLE: coupon_redemptions
-- Purpose: Track coupon redemption history
-- =================================================================

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  appointment_id TEXT,
  redeemed_at TEXT DEFAULT (datetime('now')),
  coupon_type TEXT DEFAULT 'free_haircut',
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES booking_appointments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_redemption_customer ON coupon_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_redemption_phone ON coupon_redemptions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_redemption_branch ON coupon_redemptions(branch_id);
CREATE INDEX IF NOT EXISTS idx_redemption_date ON coupon_redemptions(redeemed_at);

-- =================================================================
-- END OF MIGRATION
-- =================================================================
