-- Correct product mapping based on your actual products table
-- Your order_items have these product_ids and prices:
-- product_1769018324146 -> 150.00
-- product_1769018376439 -> 900.00  
-- product_1769018258458 -> 250.00
-- product_1769018221202 -> 200.00

-- From your products table, find the closest matches by price:
-- 150.00 -> No exact match, closest is 159.99 (ID: 11) or 149.99 (ID: 20)
-- 900.00 -> No exact match, closest is 899.99 (ID: 5)
-- 250.00 -> No exact match, closest is 249.99 (ID: 7)
-- 200.00 -> No exact match, closest is 199.99 (ID: 9)

UPDATE order_items SET product_id = '20' WHERE product_id = 'product_1769018324146';  -- 150.00 -> 149.99 (ID: 20)
UPDATE order_items SET product_id = '5' WHERE product_id = 'product_1769018376439';   -- 900.00 -> 899.99 (ID: 5)
UPDATE order_items SET product_id = '7' WHERE product_id = 'product_1769018258458';   -- 250.00 -> 249.99 (ID: 7)
UPDATE order_items SET product_id = '9' WHERE product_id = 'product_1769018221202';   -- 200.00 -> 199.99 (ID: 9)

-- Verify the fix
SELECT 
    oi.product_id,
    p.name as product_name,
    p.price as product_price,
    oi.price as order_item_price,
    COUNT(*) as order_count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY oi.product_id, p.name, p.price, oi.price
ORDER BY oi.product_id;
