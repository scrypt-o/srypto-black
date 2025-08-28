-- Seed file for AI test users
-- Run this to create common test users that AI models expect
-- NOTE: t@t.com is YOUR test user - not included here

-- Create the test users that AI always defaults to
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  -- Common AI defaults - just create them all!
  ('22222222-2222-2222-2222-222222222222', 'test@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'john.doe@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'jane.doe@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'user@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'test@test.com', crypt('test123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'alice@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'bob@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'admin@example.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create profiles for AI test users (NOT for t@t.com - that's your user)
INSERT INTO patient__persinfo__profile (user_id, first_name, last_name, email, phone)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Test', 'User', 'test@example.com', '0821234567'),
  ('33333333-3333-3333-3333-333333333333', 'John', 'Doe', 'john.doe@example.com', '0821234568'),
  ('44444444-4444-4444-4444-444444444444', 'Jane', 'Doe', 'jane.doe@example.com', '0821234569'),
  ('55555555-5555-5555-5555-555555555555', 'User', 'Test', 'user@example.com', '0821234570'),
  ('66666666-6666-6666-6666-666666666666', 'Test', 'Test', 'test@test.com', '0821234571'),
  ('77777777-7777-7777-7777-777777777777', 'Alice', 'Smith', 'alice@example.com', '0821234572'),
  ('88888888-8888-8888-8888-888888888888', 'Bob', 'Jones', 'bob@example.com', '0821234573'),
  ('99999999-9999-9999-9999-999999999999', 'Admin', 'User', 'admin@example.com', '0821234574')
ON CONFLICT (user_id) DO NOTHING;

-- Add some test data for AI users (emergency contacts as example)
-- NOT for t@t.com - that's your real test user
INSERT INTO patient__persinfo__emergency_contacts (user_id, name, relationship, phone, is_primary)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Emergency Contact', 'Parent', '0829876544', true),
  ('33333333-3333-3333-3333-333333333333', 'Jane Doe', 'Wife', '0829876545', true),
  ('44444444-4444-4444-4444-444444444444', 'John Doe', 'Husband', '0829876546', true)
ON CONFLICT DO NOTHING;