-- Safe product ID fix - first check what products you actually have
SELECT id, name, price FROM products ORDER BY id;

-- Find products that match the prices in your order_items
SELECT id, name, price FROM products WHERE price IN (150.00, 900.00, 250.00, 200.00);

-- Map to actual existing products based on price
-- Find a product with price around 150.00
SELECT id, name, price FROM products WHERE price BETWEEN 140 AND 160 LIMIT 1;

-- Find a product with price around 900.00  
SELECT id, name, price FROM products WHERE price BETWEEN 800 AND 1000 LIMIT 1;

-- Find a product with price around 250.00
SELECT id, name, price FROM products WHERE price BETWEEN 240 AND 260 LIMIT 1;

-- Find a product with price around 200.00
SELECT id, name, price FROM products WHERE price BETWEEN 190 AND 210 LIMIT 1;

-- After you find the actual product IDs, use them in the updates
-- Replace the X with actual product IDs from the queries above

-- Example (replace X with actual IDs):
-- UPDATE order_items SET product_id = 'X' WHERE product_id = 'product_1769018324146';  -- 150.00
-- UPDATE order_items SET product_id = 'X' WHERE product_id = 'product_1769018376439';  -- 900.00
-- UPDATE order_items SET product_id = 'X' WHERE product_id = 'product_1769018258458';  -- 250.00
-- UPDATE order_items SET product_id = 'X' WHERE product_id = 'product_1769018221202';  -- 200.00
