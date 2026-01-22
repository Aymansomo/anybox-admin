-- Simple version for testing (basic slug addition)
-- Add slug column to products table
ALTER TABLE products ADD COLUMN slug TEXT;

-- Update existing products with simple slug generation
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Create unique index (will fail if duplicates exist, so handle manually first)
CREATE UNIQUE INDEX idx_products_slug ON products(slug);

-- View any duplicates before making column NOT NULL
SELECT slug, COUNT(*) as count 
FROM products 
WHERE slug IS NOT NULL 
GROUP BY slug 
HAVING COUNT(*) > 1;
