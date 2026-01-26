-- Debug admin login issue
-- Check if admin account exists
SELECT id, username, email, full_name, role, is_active, created_at 
FROM admins 
WHERE email = 'admin@anybox.com';

-- Check all admin accounts
SELECT id, username, email, full_name, role, is_active, created_at 
FROM admins 
ORDER BY id;

-- Check if admin_sessions table exists
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
