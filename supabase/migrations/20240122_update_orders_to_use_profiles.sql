-- =====================================================
-- Update Orders Table to Use Profiles Instead of Customers
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- UPDATE ORDERS TABLE TO REFERENCE PROFILES
-- =====================================================

-- First, let's see if there are any existing orders with customer_id references
-- If there are existing orders, you might want to migrate the data first

-- Add new column for profile_id (as UUID type to match profiles.id)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- If you have existing data and want to migrate it, you would need to:
-- 1. Map existing customer_id to corresponding profile_id based on email
-- 2. Update the profile_id column
-- 3. Then drop the old customer_id column

-- For now, let's assume we're starting fresh or will handle migration separately
-- Drop the old customer_id column if it exists and you're ready to migrate
-- ALTER TABLE orders DROP COLUMN IF EXISTS customer_id;

-- If you want to keep both columns during transition, you can keep customer_id
-- and use profile_id for new orders

-- =====================================================
-- UPDATE RLS POLICIES FOR ORDERS
-- =====================================================

-- Update existing policies or create new ones for profile-based access
-- This depends on your security requirements

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create index for profile_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON orders(profile_id);

-- =====================================================
-- SAMPLE DATA INSERTION (if needed)
-- =====================================================

-- Sample orders using profile IDs from your profiles data
-- INSERT INTO orders (order_number, profile_id, total_amount, status, payment_status, shipping_address, billing_address, notes) VALUES
-- ('ORD-001', '275b7983-2db6-423b-9198-68a4bd09f38d', 1299.99, 'delivered', 'paid', 
--  '{"street": "RES EL FADEL IM G 10 ETAGE 2 N 201", "city": "Marrakech", "country": "Morocco", "postal_code": "40000"}', 
--  '{"street": "RES EL FADEL IM G 10 ETAGE 2 N 201", "city": "Marrakech", "country": "Morocco", "postal_code": "40000"}', 
--  'Delivered successfully'),
-- ('ORD-002', '43a57a72-0c35-4ca1-a2d2-62cc1d232027', 999.99, 'pending', 'pending', null, null, 'New order');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
