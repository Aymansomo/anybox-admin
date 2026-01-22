-- =====================================================
-- Admin Database Schema for E-Commerce Application
-- =====================================================
-- This file adds admin functionality to the existing e-commerce database
-- =====================================================

-- =====================================================
-- ADMIN TABLE CREATION
-- =====================================================

-- Admin Users Table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Sessions Table (for authentication)
CREATE TABLE admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Admin Activity Log Table
CREATE TABLE admin_activity_log (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'category', 'order', etc.
    entity_id VARCHAR(50) NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR ADMIN TABLES
-- =====================================================

-- Index for faster admin lookups
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- Index for session management
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Index for activity logs
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_action ON admin_activity_log(action);
CREATE INDEX idx_admin_activity_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at);

-- =====================================================
-- INSERT DEFAULT ADMIN USER
-- =====================================================

-- Insert default super admin user
-- Password: 'admin123' (hashed with bcrypt)
-- You should change this password in production!
INSERT INTO admins (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@anybox.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS', 'Super Administrator', 'super_admin');

-- =====================================================
-- USEFUL ADMIN QUERIES
-- =====================================================

-- Authenticate Admin User
/*
SELECT id, username, email, full_name, role, is_active 
FROM admins 
WHERE username = ? AND password_hash = ? AND is_active = TRUE;
*/

-- Create Admin Session
/*
INSERT INTO admin_sessions (admin_id, session_token, expires_at) 
VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR));
*/

-- Validate Admin Session
/*
SELECT a.id, a.username, a.email, a.full_name, a.role 
FROM admins a 
JOIN admin_sessions s ON a.id = s.admin_id 
WHERE s.session_token = ? AND s.expires_at > NOW() AND a.is_active = TRUE;
*/

-- Log Admin Activity
/*
INSERT INTO admin_activity_log (admin_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
*/

-- Get Recent Admin Activity
/*
SELECT 
    aal.*,
    ad.username,
    ad.full_name
FROM admin_activity_log aal
JOIN admins ad ON aal.admin_id = ad.id
ORDER BY aal.created_at DESC
LIMIT 50;
*/

-- Get All Admin Users
/*
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    is_active,
    last_login,
    created_at
FROM admins
ORDER BY created_at DESC;
*/

-- Update Admin Last Login
/*
UPDATE admins 
SET last_login = NOW() 
WHERE id = ?;
*/

-- Clean Expired Sessions
/*
DELETE FROM admin_sessions 
WHERE expires_at < NOW();
*/

-- =====================================================
-- SECURITY RECOMMENDATIONS
-- =====================================================

-- 1. Always use parameterized queries to prevent SQL injection
-- 2. Use strong password hashing (bcrypt, Argon2)
-- 3. Implement session timeout and secure session management
-- 4. Log all admin activities for audit trails
-- 5. Use HTTPS in production
-- 6. Implement rate limiting for login attempts
-- 7. Regularly clean expired sessions
-- 8. Consider implementing two-factor authentication

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
