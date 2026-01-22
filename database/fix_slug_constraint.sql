-- Fix NULL values in slug column before adding NOT NULL constraint
-- First, update any existing NULL slugs to temporary values
UPDATE products 
SET slug = 'temp-' || id::text
WHERE slug IS NULL;

-- Remove temporary values and set proper slugs
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug LIKE 'temp-%';

-- Now safely add NOT NULL constraint (after all NULL values are updated)
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

-- Create unique index (will fail if duplicates still exist)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Handle any remaining duplicates by appending numbers
WITH numbered_slugs AS (
    SELECT 
        id, 
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as row_num
    FROM products 
    WHERE slug IS NOT NULL
)
UPDATE products 
SET slug = products.slug || '-' || (numbered_slugs.row_num - 1)
FROM numbered_slugs 
WHERE products.id = numbered_slugs.id 
AND numbered_slugs.row_num > 1;
