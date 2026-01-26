-- Check what products you have
SELECT id, name, price FROM products ORDER BY id;

-- Check what product_ids are in your order_items
SELECT DISTINCT product_id FROM order_items ORDER BY product_id;

-- Find the mismatched product_ids
SELECT 
    oi.product_id,
    COUNT(*) as order_count,
    'Missing in products table' as status
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL
GROUP BY oi.product_id
ORDER BY oi.product_id;

-- Show sample order_items with their product_ids
SELECT 
    oi.order_id,
    oi.product_id,
    oi.quantity,
    oi.price,
    p.name as product_name
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL
LIMIT 10;
