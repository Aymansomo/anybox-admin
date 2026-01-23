-- =====================================================
-- STAFF TABLES CREATION
-- =====================================================

-- Staff Members Table
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('manager', 'staff')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Sessions Table (for authentication)
CREATE TABLE staff_sessions (
    id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Staff Activity Log Table
CREATE TABLE staff_activity_log (
    id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'order', 'product', etc.
    entity_id VARCHAR(50) NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- =====================================================
-- STAFF INDEXES
-- =====================================================

-- Staff indexes
CREATE INDEX idx_staff_username ON staff(username);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);
CREATE INDEX idx_staff_sessions_token ON staff_sessions(session_token);
CREATE INDEX idx_staff_sessions_staff_id ON staff_sessions(staff_id);
CREATE INDEX idx_staff_sessions_expires_at ON staff_sessions(expires_at);
CREATE INDEX idx_staff_activity_staff_id ON staff_activity_log(staff_id);
CREATE INDEX idx_staff_activity_action ON staff_activity_log(action);
CREATE INDEX idx_staff_activity_entity ON staff_activity_log(entity_type, entity_id);
CREATE INDEX idx_staff_activity_created_at ON staff_activity_log(created_at);

-- =====================================================
-- STAFF TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for staff table
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE STAFF DATA
-- =====================================================

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
