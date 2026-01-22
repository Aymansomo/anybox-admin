-- =====================================================
-- Sample Orders Data for Testing
-- =====================================================
-- Run this in your Supabase SQL Editor after creating the tables
-- =====================================================

-- Insert sample orders using existing profile IDs
INSERT INTO orders (order_number, total_amount, status, payment_status, payment_method, shipping_address, billing_address, user_id) VALUES
-- Orders for first profile (275b7983-2db6-423b-9198-68a4bd09f38d)
('ORD-2024-001', 1299.99, 'delivered', 'paid', 'credit_card', 
 '{"street": "RES EL FADEL IM G 10 ETAGE 2 N 201", "city": "Marrakech", "country": "Morocco", "postal_code": "40000"}', 
 '{"street": "RES EL FADEL IM G 10 ETAGE 2 N 201", "city": "Marrakech", "country": "Morocco", "postal_code": "40000"}', 
 '275b7983-2db6-423b-9198-68a4bd09f38d'),

('ORD-2024-002', 599.99, 'shipped', 'paid', 'paypal', 
 '{"street": "RES EL FADEL IM G 10 ETAGE 2 N 201", "city": "Marrakech", "country": "Morocco", "postal_code": "40000"}', 
 '{"street": "RES EL FADEL IM G 10 ETAGE 2 N 201", "city": "Marrakech", "country": "Morocco", "postal_code": "40000"}', 
 '275b7983-2db6-423b-9198-68a4bd09f38d'),

-- Orders for second profile (43a57a72-0c35-4ca1-a2d2-62cc1d232027)
('ORD-2024-003', 2499.98, 'processing', 'pending', 'credit_card', 
 '{"street": "123 Main St", "city": "Casablanca", "country": "Morocco", "postal_code": "20000"}', 
 '{"street": "123 Main St", "city": "Casablanca", "country": "Morocco", "postal_code": "20000"}', 
 '43a57a72-0c35-4ca1-a2d2-62cc1d232027'),

-- Orders for third profile (b563289d-a55c-43e8-badc-b79617e8212e)
('ORD-2024-004', 799.99, 'pending', 'pending', 'cash', 
 '{"street": "اقامة الفضل عمارة 10 ج الطابق 2 الشقة 201 مراكش", "city": "مراكش - الداوديات", "country": "Morocco", "postal_code": "40070"}', 
 '{"street": "اقامة الفضل عمارة 10 ج الطابق 2 الشقة 201 مراكش", "city": "مراكش - الداوديات", "country": "Morocco", "postal_code": "40070"}', 
 'b563289d-a55c-43e8-badc-b79617e8212e'),

('ORD-2024-005', 199.97, 'cancelled', 'failed', 'credit_card', 
 '{"street": "اقامة الفضل عمارة 10 ج الطابق 2 الشقة 201 مراكش", "city": "مراكش - الداوديات", "country": "Morocco", "postal_code": "40070"}', 
 '{"street": "اقامة الفضل عمارة 10 ج الطابق 2 الشقة 201 مراكش", "city": "مراكش - الداوديات", "country": "Morocco", "postal_code": "40070"}', 
 'b563289d-a55c-43e8-badc-b79617e8212e'),

-- Orders for fourth profile (e1a066a6-8445-48eb-b0d7-0df5742f1b35)
('ORD-2024-006', 1899.99, 'delivered', 'paid', 'paypal', 
 '{"street": "456 Oak Ave", "city": "Rabat", "country": "Morocco", "postal_code": "10000"}', 
 '{"street": "456 Oak Ave", "city": "Rabat", "country": "Morocco", "postal_code": "10000"}', 
 'e1a066a6-8445-48eb-b0d7-0df5742f1b35');

-- Insert some sample order items (if you have products)
-- These are optional - you can add them later when you have products
/*
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Order items for ORD-2024-001
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 'prod-001', 1, 1299.99),

-- Order items for ORD-2024-002
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'prod-002', 2, 299.995),

-- Order items for ORD-2024-003
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'prod-003', 1, 2499.98),

-- Order items for ORD-2024-004
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'prod-004', 1, 799.99),

-- Order items for ORD-2024-005
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 'prod-005', 1, 199.97),

-- Order items for ORD-2024-006
((SELECT id FROM orders WHERE order_number = 'ORD-2024-006'), 'prod-006', 1, 1899.99);
*/

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if orders were inserted successfully
SELECT 
  o.order_number,
  o.total_amount,
  o.status,
  o.payment_status,
  o.user_id,
  p.email,
  p.full_name,
  p.username
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;

-- Check the relationship between orders and profiles
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as orders_with_profiles,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as orders_without_profiles
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
