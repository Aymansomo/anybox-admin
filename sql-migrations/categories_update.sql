-- =====================================================
-- Categories Table Update Script
-- =====================================================
-- This script handles existing categories table and adds missing columns/features
-- =====================================================

-- =====================================================
-- CHECK EXISTING TABLE STRUCTURE
-- =====================================================

-- Check what columns exist in categories table
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'categories' AND table_schema = 'public';

-- =====================================================
-- ADD MISSING COLUMNS (IF THEY DON'T EXIST)
-- =====================================================

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'description' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN description TEXT NULL;
        RAISE NOTICE 'Added description column to categories table';
    ELSE
        RAISE NOTICE 'description column already exists in categories table';
    END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'image_url' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) NULL;
        RAISE NOTICE 'Added image_url column to categories table';
    ELSE
        RAISE NOTICE 'image_url column already exists in categories table';
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added status column to categories table';
        
        -- Update existing records to have 'active' status
        UPDATE categories SET status = 'active' WHERE status IS NULL;
    ELSE
        RAISE NOTICE 'status column already exists in categories table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column to categories table';
        
        -- Set updated_at to created_at for existing records
        UPDATE categories SET updated_at = created_at WHERE updated_at IS NULL;
    ELSE
        RAISE NOTICE 'updated_at column already exists in categories table';
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
        RAISE NOTICE 'Added index on categories.name';
    ELSE
        RAISE NOTICE 'Index on categories.name already exists';
    END IF;
END $$;

-- Add index on status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_status') THEN
        CREATE INDEX idx_categories_status ON categories(status);
        RAISE NOTICE 'Added index on categories.status';
    ELSE
        RAISE NOTICE 'Index on categories.status already exists';
    END IF;
END $$;

-- Add index on created_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'categories' AND indexname = 'idx_categories_created_at') THEN
        CREATE INDEX idx_categories_created_at ON categories(created_at);
        RAISE NOTICE 'Added index on categories.created_at';
    ELSE
        RAISE NOTICE 'Index on categories.created_at already exists';
    END IF;
END $$;

-- =====================================================
-- CREATE OR UPDATE TRIGGER
-- =====================================================

-- Create the function if it doesn't exist
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

RAISE NOTICE 'Created/updated trigger for categories.updated_at';

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
        RAISE NOTICE 'Inserted sample categories data';
    ELSE
        RAISE NOTICE 'Categories table already has data, skipping sample data insertion';
    END IF;
END $$;

-- =====================================================
-- VERIFY TABLE STRUCTURE
-- =====================================================

-- Show final table structure
-- \d categories

-- Show sample data
-- SELECT * FROM categories ORDER BY name;

RAISE NOTICE 'Categories table update completed successfully!';
