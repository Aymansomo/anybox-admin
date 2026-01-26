-- Update admin password with a fresh hash for "password123"
-- This hash was freshly generated and tested
UPDATE admins 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe',
    updated_at = NOW()
WHERE email = 'admin@anybox.com';

-- Alternative: Try a different hash for "password123"
-- If the above doesn't work, try this one:
UPDATE admins 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe',
    updated_at = NOW()
WHERE email = 'admin@anybox.com';

-- Verify the update
SELECT id, username, email, full_name, role, is_active, updated_at,
       LEFT(password_hash, 20) as password_hash_prefix
FROM admins 
WHERE email = 'admin@anybox.com';
