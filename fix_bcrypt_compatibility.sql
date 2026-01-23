-- Update admin password with a hash that matches the current bcrypt version ($2b$)
-- This hash was generated with the same bcryptjs version used in the app
UPDATE admins 
SET password_hash = '$2b$12$04NP5.lbmNAhRZgwZP.XbOoTBw5wT9A47r/Li7vV9leFym/cDSwW2',
    updated_at = NOW()
WHERE email = 'admin@anybox.com';

-- Verify the update
SELECT id, username, email, full_name, role, is_active, updated_at,
       LEFT(password_hash, 20) as password_hash_prefix
FROM admins 
WHERE email = 'admin@anybox.com';
