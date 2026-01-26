-- Fix mismatched product IDs by mapping them to existing products
-- This will update order_items to use product IDs that exist in the products table

-- First, let's see what products we have to map to
SELECT id, name FROM products ORDER BY id;

-- Update order_items with mismatched product_ids to use existing products
-- You may need to adjust these mappings based on your actual product IDs

-- Example: If you have product_ids like '1', '2', '3' in order_items but 'lp-001', 'sp-001' in products
UPDATE order_items SET product_id = 'lp-001' WHERE product_id = '1';
UPDATE order_items SET product_id = 'sp-001' WHERE product_id = '2';
UPDATE order_items SET product_id = 'tb-001' WHERE product_id = '3';

-- If you have different patterns, you can use more complex mapping:
-- Example: Map numeric IDs to product codes based on price ranges
UPDATE order_items SET product_id = 'lp-001' 
WHERE product_id NOT IN (SELECT id FROM products) 
AND price >= 1000 AND price < 1500;

UPDATE order_items SET product_id = 'sp-001' 
WHERE product_id NOT IN (SELECT id FROM products) 
AND price >= 500 AND price < 1000;

UPDATE order_items SET product_id = 'ws-001' 
WHERE product_id NOT IN (SELECT id FROM products) 
AND price < 500;

-- Verify the fix
SELECT 
    oi.product_id,
    p.name as product_name,
    COUNT(*) as order_count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY oi.product_id, p.name
ORDER BY oi.product_id;
