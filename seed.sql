-- =================================================================
-- BALIK.LAGI - Seed Data for Testing (REAL DATA)
-- =================================================================

-- Insert default branch (BOZQ Barbershop)
INSERT OR IGNORE INTO branches (id, name, address, phone, is_active)
VALUES 
  ('branch_bozq_001', 'Barber BozQ', 'Jl. Kedungsruni, RM.3, Kec. Tembalang, Kota Semarang', '089999888877', 1);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO user_profiles (id, email, password_hash, role, customer_name, branch_id, is_approved)
VALUES 
  ('admin_001', 'admin@bozq.com', '$2a$10$vqTKb7ElW1Vy9qXwg0L9U.YHJZVkDvgZUkNqJ1DQ.qpqXLZ3P8x6K', 'admin', 'Owner BozQ', 'branch_bozq_001', 1);

-- Insert REAL services (sesuai screenshot)
INSERT OR IGNORE INTO service_catalog (id, branch_id, service_name, service_tier, price, duration_minutes, description, is_active)
VALUES 
  ('service_001', 'branch_bozq_001', 'Cukur Dewasa', 'Basic', 18000, 30, 'Potong rambut dewasa standar', 1),
  ('service_002', 'branch_bozq_001', 'Cukur Anak (5-10)', 'Basic', 15000, 25, 'Potong rambut anak usia 5-10 tahun', 1),
  ('service_003', 'branch_bozq_001', 'Cukur Balita', 'Basic', 18000, 25, 'Potong rambut balita', 1),
  ('service_004', 'branch_bozq_001', 'Semir Rambut', 'Premium', 50000, 60, 'Semir rambut hitam', 1),
  ('service_005', 'branch_bozq_001', 'Hairlight/Bleaching', 'Premium', 150000, 90, 'Bleaching/highlight rambut', 1),
  ('service_006', 'branch_bozq_001', 'Keramas', 'Basic', 10000, 15, 'Cuci rambut/keramas', 1),
  ('service_007', 'branch_bozq_001', 'Kumis & Jenggot', 'Basic', 10000, 15, 'Rapikan kumis dan jenggot', 1),
  ('service_008', 'branch_bozq_001', 'Paket Lengkap BozQ', 'Mastery', 35000, 45, 'Paket cukur + keramas lengkap', 1),
  ('service_009', 'branch_bozq_001', 'Parfum', 'Basic', 20000, 5, 'Parfum rambut', 1),
  ('service_010', 'branch_bozq_001', 'Cukur + Keramas', 'Premium', 25000, 35, 'Paket cukur dan keramas', 1),
  ('service_011', 'branch_bozq_001', 'Pomade Cair', 'Basic', 15000, 5, 'Pomade cair styling', 1),
  ('service_012', 'branch_bozq_001', 'Pomade Oil Based', 'Basic', 10000, 5, 'Pomade oil based', 1),
  ('service_013', 'branch_bozq_001', 'PLB', 'Basic', 0, 5, 'Produk lainnya', 1),
  ('service_014', 'branch_bozq_001', 'Sisir Bundar', 'Basic', 5000, 5, 'Sisir bundar', 1),
  ('service_015', 'branch_bozq_001', 'Tonik Botol Kecil', 'Basic', 6000, 5, 'Tonik botol kecil', 1);

-- Insert REAL capsters (Hydar dan Mas Aris)
-- Hydar (capster1) - password: password123
INSERT OR IGNORE INTO user_profiles (id, email, password_hash, role, customer_name, branch_id, is_approved)
VALUES 
  ('capster_hydar', 'hydar@bozq.com', '$2a$10$E8xz8JfJh5YqZ9K0RqF7Oe5gN0x.qXQz5.5eVJ0gXL0Q.LZ7R8x2K', 'capster', 'Hydar', 'branch_bozq_001', 1),
  ('capster_aris', 'aris@bozq.com', '$2a$10$E8xz8JfJh5YqZ9K0RqF7Oe5gN0x.qXQz5.5eVJ0gXL0Q.LZ7R8x2K', 'capster', 'Mas Aris', 'branch_bozq_001', 1);

INSERT OR IGNORE INTO capsters (id, user_id, branch_id, display_name, specialty, rating, total_bookings, is_active)
VALUES 
  ('capster_hydar', 'capster_hydar', 'branch_bozq_001', 'Hydar', 'All Styles', 5.0, 0, 1),
  ('capster_aris', 'capster_aris', 'branch_bozq_001', 'Mas Aris', 'Classic & Modern', 5.0, 0, 1);

-- Insert sample customer (password: password123)
INSERT OR IGNORE INTO user_profiles (id, email, password_hash, role, customer_phone, customer_name, branch_id, is_approved)
VALUES 
  ('customer_john', 'john@customer.com', '$2a$10$E8xz8JfJh5YqZ9K0RqF7Oe5gN0x.qXQz5.5eVJ0gXL0Q.LZ7R8x2K', 'customer', '+628123456789', 'John Doe', 'branch_bozq_001', 1);

-- Initialize customer coupon tracking
INSERT OR IGNORE INTO customer_coupons (id, customer_id, customer_phone, branch_id, coupon_count, total_visits, coupon_eligible)
VALUES 
  ('coupon_john', 'customer_john', '+628123456789', 'branch_bozq_001', 0, 0, 0);

-- Insert access keys (sesuai request Anda)
INSERT OR IGNORE INTO access_keys (key_code, key_type, branch_id, max_usage, is_active)
VALUES 
  ('ADMIN_1767932889498', 'admin', 'branch_bozq_001', 10, 1),
  ('CAPSTER_1767932889498', 'capster', 'branch_bozq_001', 50, 1),
  ('CUSTOMER_1767932889498', 'customer', 'branch_bozq_001', -1, 1);

-- =================================================================
-- Sample bookings for testing
-- =================================================================

INSERT OR IGNORE INTO booking_appointments (id, customer_id, customer_phone, customer_name, branch_id, service_id, service_name, service_price, capster_id, capster_name, booking_date, booking_time, status)
VALUES 
  ('booking_001', 'customer_john', '+628123456789', 'John Doe', 'branch_bozq_001', 'service_001', 'Cukur Dewasa', 18000, 'capster_hydar', 'Hydar', '2026-02-02', '10:00', 'confirmed'),
  ('booking_002', 'customer_john', '+628123456789', 'John Doe', 'branch_bozq_001', 'service_008', 'Paket Lengkap BozQ', 35000, 'capster_aris', 'Mas Aris', '2026-02-03', '14:00', 'pending');
