-- Check what products exist in the database
SELECT id, name, price FROM products LIMIT 10;

-- Check what product_ids are in order_items
SELECT DISTINCT product_id FROM order_items LIMIT 10;

-- Check if there are any products at all
SELECT COUNT(*) as total_products FROM products;

-- Check if order_items have product_ids that don't exist in products
SELECT 
    oi.product_id,
    COUNT(*) as order_count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL
GROUP BY oi.product_id;
