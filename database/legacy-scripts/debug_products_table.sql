-- Debug: Check exactly what's in your products table
SELECT id, name, price FROM products ORDER BY id;

-- Check if the table structure is different
DESCRIBE products;

-- Check if there are any constraints or issues
SELECT COUNT(*) as total_products FROM products;

-- Check the exact product IDs that exist
SELECT id FROM products;
