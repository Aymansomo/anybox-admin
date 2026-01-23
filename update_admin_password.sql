-- Update admin password to the correct hash for "password123"
UPDATE admins 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe',
    updated_at = NOW()
WHERE email = 'admin@anybox.com';

-- Verify the update
SELECT id, username, email, full_name, role, is_active, updated_at 
FROM admins 
WHERE email = 'admin@anybox.com';
