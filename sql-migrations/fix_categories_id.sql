-- =====================================================
-- Fix Categories Table ID Column
-- =====================================================
-- This script fixes the auto-incrementing ID column
-- =====================================================

-- Check if id column exists and its properties
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name = 'id' 
AND table_schema = 'public';

-- If id column doesn't exist or doesn't have default value, fix it
DO $$
BEGIN
    -- Check if id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'categories' AND column_name = 'id' AND table_schema = 'public') THEN
        
        -- Check if id column has a default value (auto-increment)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'categories' AND column_name = 'id' 
                      AND table_schema = 'public' AND column_default IS NOT NULL) THEN
            
            -- Create a sequence for auto-incrementing IDs
            CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
            
            -- Set the default value for id column
            ALTER TABLE categories ALTER COLUMN id SET DEFAULT nextval('categories_id_seq');
            
            -- Set the sequence ownership
            ALTER SEQUENCE categories_id_seq OWNED BY categories.id;
            
            -- Update existing rows to have proper IDs
            UPDATE categories SET id = nextval('categories_id_seq') WHERE id IS NULL;
            
        END IF;
    ELSE
        -- If id column doesn't exist at all, add it
        ALTER TABLE categories ADD COLUMN id SERIAL PRIMARY KEY;
    END IF;
END $$;

-- Verify the fix
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;
