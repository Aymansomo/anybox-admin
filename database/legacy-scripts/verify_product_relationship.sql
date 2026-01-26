-- Verify that order_items and products have matching IDs
SELECT 
    oi.product_id,
    oi.price as order_price,
    p.name as product_name,
    p.price as product_price,
    CASE WHEN p.id IS NOT NULL THEN 'MATCH' ELSE 'NO MATCH' END as status
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY oi.product_id, oi.price, p.name, p.price, p.id
ORDER BY oi.product_id;

-- Check if there are any order_items without matching products
SELECT 
    oi.product_id,
    oi.price,
    COUNT(*) as count
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL
GROUP BY oi.product_id, oi.price;
