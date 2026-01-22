-- =====================================================
-- Categories Table Schema for E-Commerce Application
-- =====================================================
-- This file adds categories functionality to the existing e-commerce database
-- =====================================================

-- =====================================================
-- CATEGORIES TABLE CREATION
-- =====================================================

-- Categories Table
CREATE TABLE categories (
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
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_created_at ON categories(created_at);

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

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, description, status) VALUES
('Electronics', 'Electronic devices and accessories', 'active'),
('Clothing', 'Fashion and apparel items', 'active'),
('Books', 'Books and educational materials', 'active'),
('Home & Garden', 'Home decoration and garden supplies', 'active'),
('Sports & Outdoors', 'Sports equipment and outdoor gear', 'active');

-- =====================================================
-- OPTIONAL: ADD CATEGORY_ID TO PRODUCTS TABLE
-- =====================================================
-- Run this section separately if you want to add category support to products

-- Check if products table exists and add category_id column
-- Uncomment and run this separately if needed:

/*
DO $$
BEGIN
    -- Check if products table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        -- Check if category_id column doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'category_id' AND table_schema = 'public') THEN
            -- Add category_id column
            ALTER TABLE products ADD COLUMN category_id INTEGER NULL;
            
            -- Add foreign key constraint (only if categories table exists)
            ALTER TABLE products 
            ADD CONSTRAINT fk_products_category 
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
            
            -- Create index for better performance
            CREATE INDEX idx_products_category_id ON products(category_id);
            
            RAISE NOTICE 'Added category_id column to products table';
        ELSE
            RAISE NOTICE 'category_id column already exists in products table';
        END IF;
    ELSE
        RAISE NOTICE 'Products table does not exist, skipping category_id addition';
    END IF;
END $$;
*/

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get all categories with product count (requires category_id in products table)
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
SET name = $1, description = $2, image_url = $3, status = $4
WHERE id = $5;
*/

-- Delete category
/*
DELETE FROM categories 
WHERE id = $1;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
