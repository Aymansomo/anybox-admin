-- =====================================================
-- Create "All" Category for Uncategorized Products (Final Fix)
-- =====================================================
-- This creates a special category that won't be shown in UI
-- Products without categories will be assigned here automatically
-- =====================================================

-- First, check if "All" category already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'All') THEN
        -- Insert "All" category
        INSERT INTO categories (name, slug, description, status) VALUES
        ('All', 'all', 'Default category for uncategorized products', 'inactive');
        
        RAISE NOTICE 'All category created successfully';
    ELSE
        RAISE NOTICE 'All category already exists';
    END IF;
END $$;

-- =====================================================
-- Update existing uncategorized products to point to "All" category
-- =====================================================

-- Get the ID of the "All" category and update uncategorized products
DO $$
DECLARE
    all_category_id INTEGER;
    updated_count INTEGER;
BEGIN
    -- Get the ID of the "All" category
    SELECT id INTO all_category_id FROM categories WHERE name = 'All' LIMIT 1;
    
    -- Update products that have NULL category_id to point to "All" category
    UPDATE products 
    SET category_id = all_category_id 
    WHERE category_id IS NULL;
    
    -- Get count of updated products
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Updated % uncategorized products to All category (ID: %)', updated_count, all_category_id;
END $$;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Check that "All" category exists
SELECT * FROM categories WHERE name = 'All';

-- Count uncategorized products (should be 0 after this script)
SELECT COUNT(*) as uncategorized_products 
FROM products 
WHERE category_id IS NULL;
