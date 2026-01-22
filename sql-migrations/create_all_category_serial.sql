-- =====================================================
-- Create "All" Category for Uncategorized Products (Fixed for SERIAL)
-- =====================================================
-- This creates a special category that won't be shown in UI
-- Products without categories will be assigned here automatically
-- =====================================================

-- Insert "All" category if it doesn't exist (using next available ID)
INSERT INTO categories (name, slug, description, status) VALUES
('All', 'all', 'Default category for uncategorized products', 'inactive')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Get the ID of the "All" category (whatever ID was assigned)
-- =====================================================

-- Create a variable to store the "All" category ID
DO $$
DECLARE
    all_category_id INTEGER;
BEGIN
    -- Get the ID of the "All" category
    SELECT id INTO all_category_id FROM categories WHERE name = 'All' LIMIT 1;
    
    -- Update products that have NULL category_id to point to "All" category
    UPDATE products 
    SET category_id = all_category_id 
    WHERE category_id IS NULL;
    
    RAISE NOTICE 'All category created with ID: %', all_category_id;
END $$;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Check that "All" category was created
SELECT * FROM categories WHERE name = 'All';

-- Count uncategorized products (should be 0 after this script)
SELECT COUNT(*) as uncategorized_products 
FROM products 
WHERE category_id IS NULL;
