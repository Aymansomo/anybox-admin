-- Sample staff data for testing
-- Insert sample staff members with hashed passwords

-- Manager account
INSERT INTO staff (username, email, password_hash, full_name, role, is_active) VALUES
('manager1', 'manager@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'John Manager', 'manager', true);

-- Staff accounts
INSERT INTO staff (username, email, password_hash, full_name, role, is_active) VALUES
('staff1', 'sarah@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Sarah Johnson', 'staff', true),
('staff2', 'mike@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Mike Chen', 'staff', true),
('staff3', 'emma@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Emma Wilson', 'staff', false);

-- Note: The password hash above is for the password "password123"
-- All sample accounts use the same password for testing purposes
