-- Check what product IDs actually exist in your products table
SELECT id, name, price FROM products ORDER BY id;

-- Check the exact product IDs in your order_items
SELECT DISTINCT product_id, price FROM order_items ORDER BY product_id;

-- Find products that match the prices in your order_items
SELECT id, name, price FROM products WHERE price IN (150.00, 900.00, 250.00, 200.00);
