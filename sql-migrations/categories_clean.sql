-- =====================================================
-- Categories Table Update Script
-- =====================================================
-- This script safely updates existing categories table
-- =====================================================

-- =====================================================
-- ADD MISSING COLUMNS (IF THEY DON'T EXIST)
-- =====================================================

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'description' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN description TEXT NULL;
    END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'image_url' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) NULL;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        UPDATE categories SET status = 'active' WHERE status IS NULL;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        UPDATE categories SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

-- =====================================================
-- ADD MISSING INDEXES
-- =====================================================

-- Add index on name if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_name') THEN
        CREATE INDEX idx_categories_name ON categories(name);
    END IF;
END $$;

-- Add index on status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_status') THEN
        CREATE INDEX idx_categories_status ON categories(status);
    END IF;
END $$;

-- Add index on created_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_created_at') THEN
        CREATE INDEX idx_categories_created_at ON categories(created_at);
    END IF;
END $$;

-- =====================================================
-- CREATE OR UPDATE TRIGGER
-- =====================================================

-- Create the function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT SAMPLE DATA (IF TABLE IS EMPTY)
-- =====================================================

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM categories) = 0 THEN
        INSERT INTO categories (name, description, status) VALUES
        ('Electronics', 'Electronic devices and accessories', 'active'),
        ('Clothing', 'Fashion and apparel items', 'active'),
        ('Books', 'Books and educational materials', 'active'),
        ('Home & Garden', 'Home decoration and garden supplies', 'active'),
        ('Sports & Outdoors', 'Sports equipment and outdoor gear', 'active');
    END IF;
END $$;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
