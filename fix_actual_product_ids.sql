-- Fix the actual product IDs in your order_items
-- Your order_items have: product_1769018324146, product_1769018376439, product_1769018258458, product_1769018221202
-- Your products have: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20

-- Map the timestamp-based product IDs to your numeric product IDs based on price
-- product_1769018324146 has price 150.00 -> map to a low-priced product (like wireless earbuds)
-- product_1769018376439 has price 900.00 -> map to a high-priced product (like laptop)
-- product_1769018258458 has price 250.00 -> map to a medium-priced product (like headphones)
-- product_1769018221202 has price 200.00 -> map to a low-medium-priced product (like keyboard)

UPDATE order_items SET product_id = '8' WHERE product_id = 'product_1769018324146';  -- 150.00 -> Wireless Earbuds
UPDATE order_items SET product_id = '1' WHERE product_id = 'product_1769018376439';  -- 900.00 -> Laptop Pro 15"
UPDATE order_items SET product_id = '7' WHERE product_id = 'product_1769018258458';  -- 250.00 -> Wireless Headphones  
UPDATE order_items SET product_id = '9' WHERE product_id = 'product_1769018221202';  -- 200.00 -> Mechanical Keyboard

-- Verify the fix
SELECT 
    oi.product_id,
    p.name as product_name,
    oi.price,
    COUNT(*) as order_count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id::text
GROUP BY oi.product_id, p.name, oi.price
ORDER BY oi.product_id;

-- Check if any order_items still don't have matching products
SELECT 
    oi.product_id,
    oi.price,
    COUNT(*) as order_count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id::text
WHERE p.id IS NULL
GROUP BY oi.product_id, oi.price;
