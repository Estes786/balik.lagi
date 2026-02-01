-- =================================================================
-- BALIK.LAGI - Seed Data for Testing
-- =================================================================

-- Insert default branch (BOZQ Barbershop)
INSERT OR IGNORE INTO branches (id, name, address, phone, is_active)
VALUES 
  ('branch_bozq_001', 'BOZQ Barbershop', 'Jl. Kedungsruni, RM.3, Kec. Tembalang, Kota Semarang', '089999888877', 1);

-- Insert default admin user
INSERT OR IGNORE INTO user_profiles (id, email, password_hash, role, branch_id, is_approved)
VALUES 
  ('admin_001', 'adminbozq1@gmail.com', '$2a$10$YourHashedPasswordHere', 'admin', 'branch_bozq_001', 1);

-- Insert sample services
INSERT OR IGNORE INTO service_catalog (id, branch_id, service_name, service_tier, price, duration_minutes, description)
VALUES 
  ('service_001', 'branch_bozq_001', 'Cukur Rambut Basic', 'Basic', 25000, 30, 'Potong rambut basic dengan styling standar'),
  ('service_002', 'branch_bozq_001', 'Cukur Premium + Cuci', 'Premium', 35000, 45, 'Potong rambut premium dengan cuci dan styling'),
  ('service_003', 'branch_bozq_001', 'Paket Mastery Complete', 'Mastery', 50000, 60, 'Paket lengkap: potong, cuci, facial, dan styling premium');

-- Insert sample capsters
INSERT OR IGNORE INTO user_profiles (id, email, password_hash, role, customer_name, branch_id, is_approved)
VALUES 
  ('capster_001', 'capster1@bozq.com', '$2a$10$YourHashedPasswordHere', 'capster', 'Mas Agus', 'branch_bozq_001', 1),
  ('capster_002', 'capster2@bozq.com', '$2a$10$YourHashedPasswordHere', 'capster', 'Mas Budi', 'branch_bozq_001', 1),
  ('capster_003', 'capster3@bozq.com', '$2a$10$YourHashedPasswordHere', 'capster', 'Mas Candra', 'branch_bozq_001', 1);

INSERT OR IGNORE INTO capsters (id, user_id, branch_id, display_name, specialty, rating, is_active)
VALUES 
  ('capster_001', 'capster_001', 'branch_bozq_001', 'Mas Agus', 'Fade Haircut Specialist', 4.9, 1),
  ('capster_002', 'capster_002', 'branch_bozq_001', 'Mas Budi', 'Pompadour Expert', 4.8, 1),
  ('capster_003', 'capster_003', 'branch_bozq_001', 'Mas Candra', 'Classic & Modern', 4.7, 1);

-- Insert sample customer
INSERT OR IGNORE INTO user_profiles (id, email, password_hash, role, customer_phone, customer_name, branch_id, is_approved)
VALUES 
  ('customer_001', 'customerbozq1@gmail.com', '$2a$10$YourHashedPasswordHere', 'customer', '+628123456789', 'Customer Test', 'branch_bozq_001', 1);

-- Insert access keys
INSERT OR IGNORE INTO access_keys (key_code, key_type, branch_id, max_usage)
VALUES 
  ('ADMIN_BOZQ_ACCESS_1', 'admin', 'branch_bozq_001', 5),
  ('CAPSTER_1767932889498', 'capster', 'branch_bozq_001', 50),
  ('CUSTOMER_1767932889498', 'customer', 'branch_bozq_001', -1);
