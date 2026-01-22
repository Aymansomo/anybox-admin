-- =====================================================
-- Add Stock Field to Products Table
-- =====================================================
-- Run this script to add the missing stock field to existing products table
-- =====================================================

-- Add stock column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'stock' AND table_schema = 'public') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0 CHECK (stock >= 0);
        
        -- Update existing products to have a default stock value
        UPDATE products SET stock = 50 WHERE stock IS NULL;
        
        -- Make the column NOT NULL after updating existing rows
        ALTER TABLE products ALTER COLUMN stock SET NOT NULL;
    END IF;
END $$;

-- =====================================================
-- Verify the column was added
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'stock'
AND table_schema = 'public';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
