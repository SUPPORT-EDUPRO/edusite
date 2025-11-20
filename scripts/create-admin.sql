-- Create test admin user
-- Run this in Supabase SQL Editor or via: supabase db execute -f scripts/create-admin.sql

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert test admin user
-- Email: admin@test.com
-- Password: admin123
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Admin"}',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Confirm the user was created
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@test.com';
