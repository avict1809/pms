-- Insert admin user directly (bypass RLS for initial setup)
-- Run this in Supabase SQL Editor

-- First, temporarily disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert admin user (replace USER_ID with the actual UUID from Supabase Auth)
INSERT INTO users (
    id,
    email,
    role,
    display_name,
    is_active,
    is_first_login,
    created_at
) VALUES (
    '68893eec-ce00-4808-8405-fe8c9e7f5628', -- Replace with your actual user ID
    'admin1@pms.com',
    'admin',
    'System Administrator',
    true,
    false,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    is_first_login = EXCLUDED.is_first_login;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify the user was created
SELECT * FROM users WHERE email = 'admin1@pms.com'; 