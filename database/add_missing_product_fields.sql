-- Add missing fields to products table
-- Add slug field
ALTER TABLE products ADD COLUMN slug TEXT;

-- Add gallery_images column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' 
        AND column_name='gallery_images'
    ) THEN
        ALTER TABLE products ADD COLUMN gallery_images TEXT[];
    END IF;
END $$;

-- Update existing products to have slug based on name
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'gi'))
WHERE slug IS NULL;

-- Update existing products to have empty gallery array if null
UPDATE products 
SET gallery_images = '{}' 
WHERE gallery_images IS NULL;

-- Add unique constraint on slug
ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- Add comments to document the columns
COMMENT ON COLUMN products.slug IS 'URL-friendly slug generated from product name';
COMMENT ON COLUMN products.gallery_images IS 'Array of additional product images for gallery display';
