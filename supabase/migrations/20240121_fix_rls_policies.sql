-- Fix RLS policies for products table
-- This migration disables RLS for admin operations or creates permissive policies

-- Option 1: Disable RLS entirely (simpler for admin dashboard)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_features DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policies (uncomment if you prefer RLS)
/*
-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create permissive policies that allow all operations
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL USING (true);

-- Drop existing policies on related tables
DROP POLICY IF EXISTS "Product features are viewable by everyone" ON product_features;
DROP POLICY IF EXISTS "Admins can manage product features" ON product_features;
DROP POLICY IF EXISTS "Product colors are viewable by everyone" ON product_colors;
DROP POLICY IF EXISTS "Admins can manage product colors" ON product_colors;
DROP POLICY IF EXISTS "Product sizes are viewable by everyone" ON product_sizes;
DROP POLICY IF EXISTS "Admins can manage product sizes" ON product_sizes;

-- Create permissive policies for related tables
CREATE POLICY "Allow all operations on product_features" ON product_features
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on product_colors" ON product_colors
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on product_sizes" ON product_sizes
    FOR ALL USING (true);
*/
