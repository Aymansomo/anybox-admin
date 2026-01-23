-- =====================================================
-- ENSURE MANAGER FUNCTIONALITY - Complete Setup
-- =====================================================
-- This script ensures all necessary database structures exist
-- for the manager orders functionality to work properly
-- =====================================================

-- 1. Ensure staff_id column exists in orders table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'staff_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN staff_id INT REFERENCES staff(id) ON DELETE SET NULL;
        
        -- Create index for staff_id for better performance
        CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);
        
        -- Add comment to explain the field
        COMMENT ON COLUMN orders.staff_id IS 'ID of the staff member assigned to handle this order';
        
        RAISE NOTICE 'Added staff_id column to orders table';
    ELSE
        RAISE NOTICE 'staff_id column already exists in orders table';
    END IF;
END $$;

-- 2. Ensure staff table exists with proper structure
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
        
        RAISE NOTICE 'Created staff table';
    ELSE
        RAISE NOTICE 'staff table already exists';
    END IF;
END $$;

-- 3. Ensure staff_sessions table exists
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
        
        -- Create indexes
        CREATE INDEX idx_staff_sessions_token ON staff_sessions(session_token);
        CREATE INDEX idx_staff_sessions_staff_id ON staff_sessions(staff_id);
        CREATE INDEX idx_staff_sessions_expires_at ON staff_sessions(expires_at);
        
        RAISE NOTICE 'Created staff_sessions table';
    ELSE
        RAISE NOTICE 'staff_sessions table already exists';
    END IF;
END $$;

-- 4. Ensure staff_activity_log table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'staff_activity_log' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE staff_activity_log (
            id SERIAL PRIMARY KEY,
            staff_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id VARCHAR(50) NULL,
            old_values JSONB NULL,
            new_values JSONB NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
        );
        
        -- Create indexes
        CREATE INDEX idx_staff_activity_staff_id ON staff_activity_log(staff_id);
        CREATE INDEX idx_staff_activity_action ON staff_activity_log(action);
        CREATE INDEX idx_staff_activity_entity ON staff_activity_log(entity_type, entity_id);
        CREATE INDEX idx_staff_activity_created_at ON staff_activity_log(created_at);
        
        RAISE NOTICE 'Created staff_activity_log table';
    ELSE
        RAISE NOTICE 'staff_activity_log table already exists';
    END IF;
END $$;

-- 5. Create or update the staff_orders_view
CREATE OR REPLACE VIEW staff_orders_view AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.shipping_address,
    o.billing_address,
    o.notes,
    o.tracking_number,
    o.shipped_at,
    o.delivered_at,
    o.created_at,
    o.updated_at,
    o.user_id,
    o.customer_id,
    o.staff_id,
    -- Customer information from profiles
    CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN p.first_name || ' ' || p.last_name
        WHEN p.first_name IS NOT NULL THEN p.first_name
        WHEN p.email IS NOT NULL THEN SPLIT_PART(p.email, '@', 1)
        ELSE 'Unknown Customer'
    END as customer_name,
    COALESCE(p.email, 'unknown@example.com') as customer_email,
    COALESCE(p.phone, '') as customer_phone,
    -- Customer address from profiles
    p.address,
    p.city,
    p.state,
    p.zip_code,
    p.country
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE o.staff_id IS NOT NULL
ORDER BY o.created_at DESC;

-- 6. Create or update the admin_orders view to include staff information
CREATE OR REPLACE VIEW admin_orders AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.shipping_address,
    o.billing_address,
    o.notes,
    o.tracking_number,
    o.shipped_at,
    o.delivered_at,
    o.created_at,
    o.updated_at,
    o.user_id,
    o.customer_id,
    o.staff_id,
    -- Customer information from profiles
    CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN p.first_name || ' ' || p.last_name
        WHEN p.first_name IS NOT NULL THEN p.first_name
        WHEN p.email IS NOT NULL THEN SPLIT_PART(p.email, '@', 1)
        ELSE 'Unknown Customer'
    END as customer_name,
    COALESCE(p.email, 'unknown@example.com') as customer_email,
    COALESCE(p.phone, '') as customer_phone,
    -- Customer address from profiles
    p.address,
    p.city,
    p.state,
    p.zip_code,
    p.country,
    -- Staff information
    s.full_name as staff_name,
    s.email as staff_email,
    s.role as staff_role
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN staff s ON o.staff_id = s.id
ORDER BY o.created_at DESC;

-- 7. Ensure trigger function exists for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for tables that need updated_at
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample staff data if staff table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM staff) = 0 THEN
        INSERT INTO staff (username, email, password_hash, full_name, role, is_active) VALUES
        ('manager1', 'manager@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'John Manager', 'manager', true),
        ('staff1', 'sarah@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Sarah Johnson', 'staff', true),
        ('staff2', 'mike@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Mike Chen', 'staff', true),
        ('staff3', 'emma@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'Emma Wilson', 'staff', false);
        
        RAISE NOTICE 'Inserted sample staff data';
    ELSE
        RAISE NOTICE 'Staff table already has data';
    END IF;
END $$;

-- 10. Verification queries
RAISE NOTICE '=== VERIFICATION ===';
RAISE NOTICE 'Orders table columns:';
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

RAISE NOTICE 'Staff members:';
SELECT id, username, email, full_name, role, is_active 
FROM staff 
ORDER BY id;

RAISE NOTICE 'Orders with staff assignments:';
SELECT o.order_number, o.customer_name, s.full_name as assigned_staff
FROM orders o
LEFT JOIN staff s ON o.staff_id = s.id
LIMIT 5;

RAISE NOTICE '=== MANAGER FUNCTIONALITY SETUP COMPLETE ===';
RAISE NOTICE 'You can now access the manager page at: /manager-orders';
RAISE NOTICE 'Login with manager credentials: manager@company.com / password123';
