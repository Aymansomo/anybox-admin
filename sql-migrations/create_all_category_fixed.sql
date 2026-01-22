-- =====================================================
-- Create "All" Category for Uncategorized Products (Fixed)
-- =====================================================
-- This creates a special category that won't be shown in UI
-- Products without categories will be assigned here automatically
-- =====================================================

-- Insert "All" category if it doesn't exist
INSERT INTO categories (id, name, slug, description, status) VALUES
(0, 'All', 'all', 'Default category for uncategorized products', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Update existing uncategorized products to point to "All" category
-- =====================================================

-- Update products that have NULL category_id to point to "All" category
UPDATE products 
SET category_id = 0 
WHERE category_id IS NULL;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

SELECT 'All category created successfully' as status;

-- Check that "All" category was created
SELECT * FROM categories WHERE id = 0;

-- Count uncategorized products (should be 0 after this script)
SELECT COUNT(*) as uncategorized_products 
FROM products 
WHERE category_id IS NULL;
