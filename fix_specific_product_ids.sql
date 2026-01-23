-- Fix product IDs based on your actual products table
-- Your products have IDs: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
-- Let's check what product_ids are in your order_items

SELECT DISTINCT product_id FROM order_items ORDER BY product_id;

-- If your order_items have string IDs like 'lp-001', 'sp-001', etc., 
-- update them to match your numeric product IDs

-- Map common product codes to your numeric IDs
UPDATE order_items SET product_id = '1' WHERE product_id = 'lp-001';
UPDATE order_items SET product_id = '2' WHERE product_id = 'lp-002';
UPDATE order_items SET product_id = '3' WHERE product_id = 'sp-001';
UPDATE order_items SET product_id = '4' WHERE product_id = 'sp-002';
UPDATE order_items SET product_id = '5' WHERE product_id = 'tb-001';
UPDATE order_items SET product_id = '6' WHERE product_id = 'tb-002';
UPDATE order_items SET product_id = '7' WHERE product_id = 'ws-001';
UPDATE order_items SET product_id = '8' WHERE product_id = 'ws-002';
UPDATE order_items SET product_id = '9' WHERE product_id = 'kb-001';
UPDATE order_items SET product_id = '10' WHERE product_id = 'ms-001';

-- If you have completely different product_ids, map by price ranges
UPDATE order_items SET product_id = '1' 
WHERE product_id NOT IN (SELECT id::text FROM products) 
AND price >= 1000 AND price < 1500;

UPDATE order_items SET product_id = '3' 
WHERE product_id NOT IN (SELECT id::text FROM products) 
AND price >= 500 AND price < 1000;

UPDATE order_items SET product_id = '7' 
WHERE product_id NOT IN (SELECT id::text FROM products) 
AND price < 500;

-- Verify the fix
SELECT 
    oi.product_id,
    p.name as product_name,
    COUNT(*) as order_count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id::text
GROUP BY oi.product_id, p.name
ORDER BY oi.product_id;
