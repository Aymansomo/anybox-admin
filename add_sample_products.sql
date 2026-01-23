-- Add sample products that match the product_ids in your order_items
-- Based on your order data, I can see product_ids like 'lp-001', 'sp-001', etc.

INSERT INTO products (id, name, description, price, category_id, in_stock, stock, status) VALUES
('lp-001', 'Laptop Pro 15"', 'High-performance laptop with 15" display, Intel Core i7, 16GB RAM, 512GB SSD', 1299.99, 1, true, 50, 'active'),
('lp-002', 'Laptop Air 13"', 'Ultra-light laptop with 13" display, Apple M2 chip, 8GB RAM, 256GB SSD', 1799.99, 1, true, 30, 'active'),
('sp-001', 'Smartphone X', 'Latest flagship smartphone with 6.5" display, 5G connectivity, 128GB storage', 999.99, 1, true, 100, 'active'),
('sp-002', 'Smartphone Pro', 'Premium smartphone with 6.7" display, triple camera, 256GB storage', 1299.99, 1, true, 75, 'active'),
('tb-001', 'Tablet Pro 12"', 'Professional tablet with 12.9" display, stylus support, 64GB storage', 899.99, 1, true, 40, 'active'),
('tb-002', 'Tablet Air 10"', 'Lightweight tablet with 10.5" display, Wi-Fi only, 32GB storage', 499.99, 1, true, 60, 'active'),
('ws-001', 'Wireless Headphones', 'Noise-cancelling wireless headphones with 20-hour battery', 249.99, 1, true, 80, 'active'),
('ws-002', 'Wireless Earbuds', 'True wireless earbuds with charging case, 24-hour battery', 149.99, 1, true, 120, 'active'),
('kb-001', 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches, programmable keys', 149.99, 1, true, 35, 'active'),
('ms-001', 'Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 79.99, 1, true, 90, 'active')
ON CONFLICT (id) DO NOTHING;

-- Verify the products were added
SELECT id, name, price FROM products ORDER BY id;
