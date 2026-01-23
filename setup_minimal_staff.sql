-- =====================================================
-- MINIMAL STAFF SETUP - staff_id already exists
-- =====================================================

-- 1. Create staff table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'staff' 
        AND table_schema = 'public'
    ) THEN
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
        
        -- Create indexes
        CREATE INDEX idx_staff_username ON staff(username);
        CREATE INDEX idx_staff_email ON staff(email);
        CREATE INDEX idx_staff_role ON staff(role);
        CREATE INDEX idx_staff_is_active ON staff(is_active);
    END IF;
END $$;

-- 2. Create staff_sessions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'staff_sessions' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE staff_sessions (
            id SERIAL PRIMARY KEY,
            staff_id INT NOT NULL,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_staff_sessions_token ON staff_sessions(session_token);
        CREATE INDEX idx_staff_sessions_staff_id ON staff_sessions(staff_id);
        CREATE INDEX idx_staff_sessions_expires_at ON staff_sessions(expires_at);
    END IF;
END $$;

-- 3. Insert sample staff data if staff table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM staff) = 0 THEN
        INSERT INTO staff (username, email, password_hash, full_name, role, is_active) VALUES
        ('manager1', 'manager@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'John Manager', 'manager', true),
        ('staff1', 'sarah@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Sarah Johnson', 'staff', true),
        ('staff2', 'mike@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Mike Chen', 'staff', true),
        ('staff3', 'emma@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Emma Wilson', 'staff', false);
    END IF;
END $$;
