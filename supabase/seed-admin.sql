-- Insert dummy admin user
-- This script creates an admin user for testing purposes

-- First, create the user in Supabase Auth (you'll need to do this manually in the Supabase dashboard)
-- Go to Authentication > Users > Add User
-- Email: admin@pms.com
-- Password: admin123456

-- Then, insert the user record in our users table
INSERT INTO users (
    id,
    email,
    role,
    display_name,
    is_active,
    is_first_login,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Replace with actual UUID from Supabase Auth
    'admin@pms.com',
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

-- Also create some test users for other roles
INSERT INTO users (
    id,
    email,
    role,
    display_name,
    is_active,
    is_first_login,
    created_at
) VALUES 
    ('00000000-0000-0000-0000-000000000002', 'supervisor@pms.com', 'supervisor', 'Test Supervisor', true, false, NOW()),
    ('00000000-0000-0000-0000-000000000003', 'student@pms.com', 'student', 'Test Student', true, false, NOW())
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    is_active = EXCLUDED.is_active,
    is_first_login = EXCLUDED.is_first_login; 