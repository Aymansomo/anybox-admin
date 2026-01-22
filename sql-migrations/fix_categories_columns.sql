-- =====================================================
-- Fix Categories Table Column Names
-- =====================================================
-- This script adds missing columns and handles column name differences
-- =====================================================

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

-- Create a view or update the code to use existing column names
-- Option 1: Rename columns to match the code (uncomment if you want to rename)
-- ALTER TABLE categories RENAME COLUMN image TO image_url;

-- Option 2: Create a view that maps the existing columns to expected names
CREATE OR REPLACE VIEW categories_view AS
SELECT 
    id,
    name,
    slug,
    description,
    image AS image_url,
    status,
    created_at,
    updated_at
FROM categories;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
