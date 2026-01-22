-- Alternative version for PostgreSQL with different syntax
-- Add slug column to products table
ALTER TABLE products ADD COLUMN slug TEXT;

-- Create unique index on slug to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Update existing products with auto-generated slugs (PostgreSQL version)
UPDATE products 
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
    )
)
WHERE slug IS NULL OR slug = '';

-- Handle any potential duplicate slugs by appending numbers
WITH numbered_slugs AS (
    SELECT 
        id, 
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as row_num
    FROM products 
    WHERE slug IS NOT NULL
)
UPDATE products 
SET slug = slug || '-' || (row_num - 1)
FROM numbered_slugs 
WHERE products.id = numbered_slugs.id 
AND numbered_slugs.row_num > 1;

-- Make slug column NOT NULL (after all updates are done)
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
