-- =====================================================
-- Categories Table Schema for E-Commerce Application
-- =====================================================
-- This file adds categories functionality to the existing e-commerce database
-- =====================================================

-- =====================================================
-- CATEGORIES TABLE CREATION
-- =====================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR CATEGORIES TABLE
-- =====================================================

-- Index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FOREIGN KEY CONSTRAINTS (if products table exists)
-- =====================================================

-- Add category_id to products table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'category_id') THEN
            ALTER TABLE products ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
        END IF;
    END IF;
END $$;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, description, status) VALUES
('Electronics', 'Electronic devices and accessories', 'active'),
('Clothing', 'Fashion and apparel items', 'active'),
('Books', 'Books and educational materials', 'active'),
('Home & Garden', 'Home decoration and garden supplies', 'active'),
('Sports & Outdoors', 'Sports equipment and outdoor gear', 'active')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get all categories with product count
/*
SELECT 
    c.id,
    c.name,
    c.description,
    c.image_url,
    c.status,
    c.created_at,
    c.updated_at,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name, c.description, c.image_url, c.status, c.created_at, c.updated_at
ORDER BY c.name;
*/

-- Get active categories only
/*
SELECT * FROM categories 
WHERE status = 'active' 
ORDER BY name;
*/

-- Update category
/*
UPDATE categories 
SET name = ?, description = ?, image_url = ?, status = ?
WHERE id = ?;
*/

-- Delete category (will set category_id to NULL in products)
/*
DELETE FROM categories 
WHERE id = ?;
*/

-- =====================================================
-- SUPABASE STORAGE SETUP
-- =====================================================

-- Create category-images bucket in Supabase Storage
-- This needs to be done manually in Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Create new bucket named "category-images"
-- 3. Set up appropriate policies (public read, authenticated write)

-- Example Storage Policies:
/*
-- Allow public read access to category images
CREATE POLICY "Category images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'category-images');

-- Allow authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update category images
CREATE POLICY "Authenticated users can update category images" ON storage.objects
FOR UPDATE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete category images
CREATE POLICY "Authenticated users can delete category images" ON storage.objects
FOR DELETE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
