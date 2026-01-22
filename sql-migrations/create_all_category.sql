-- =====================================================
-- Create "All" Category for Uncategorized Products
-- =====================================================
-- This creates a special category that won't be shown in the UI
-- Products without categories will be assigned here automatically
-- =====================================================

-- Insert the "All" category if it doesn't exist
INSERT INTO categories (id, name, slug, description, status) VALUES
(0, 'All', 'all', 'Default category for uncategorized products', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Update existing uncategorized products to point to "All" category
-- =====================================================

-- Update products that have NULL category_id to point to the "All" category
UPDATE products 
SET category_id = 0 
WHERE category_id IS NULL;

-- =====================================================
-- Create function to handle category deletion
-- =====================================================

-- Function to reassign products when category is deleted
CREATE OR REPLACE FUNCTION reassign_products_on_category_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- When a category is deleted, reassign its products to the "All" category (id = 0)
    UPDATE products 
    SET category_id = 0 
    WHERE category_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically reassign products when category is deleted
DROP TRIGGER IF EXISTS category_delete_reassign ON categories;
CREATE TRIGGER category_delete_reassign
BEFORE DELETE ON categories
FOR EACH ROW
WHEN (OLD.id != 0) -- Don't trigger for the "All" category itself
EXECUTE FUNCTION reassign_products_on_category_delete();

-- =====================================================
-- Verify setup
-- =====================================================

SELECT 'All category created and trigger set up successfully' as status;

-- Check the "All" category
SELECT * FROM categories WHERE id = 0;

-- Count uncategorized products (should be 0 after this script)
SELECT COUNT(*) as uncategorized_products 
FROM products 
WHERE category_id IS NULL;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
