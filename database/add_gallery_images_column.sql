-- Add gallery_images column to products table
ALTER TABLE products ADD COLUMN gallery_images TEXT[];

-- Update existing products to have empty gallery array if null
UPDATE products 
SET gallery_images = '{}' 
WHERE gallery_images IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN products.gallery_images IS 'Array of additional product images for gallery display';
