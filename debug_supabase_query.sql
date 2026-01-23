-- Debug the Supabase query structure
-- Test the exact query that the TypeScript code is running

SELECT 
    oi.quantity,
    oi.price,
    oi.product_id,
    products:product_id (
        name
    )
FROM order_items oi
WHERE oi.order_id = 18  -- Use an actual order_id from your data
LIMIT 5;

-- Also test a simpler query to see the relationship structure
SELECT 
    oi.quantity,
    oi.price,
    oi.product_id,
    p.name as product_name
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 18
LIMIT 5;
