-- =====================================================
-- Check Categories Table Structure
-- =====================================================

-- Check if categories table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT COUNT(*) as total_categories FROM categories;

-- Show sample data if exists
SELECT * FROM categories LIMIT 3;
