-- Add image position column to about_banner table
ALTER TABLE about_banner 
ADD COLUMN IF NOT EXISTS image_position VARCHAR(10) NOT NULL DEFAULT 'left';

-- Update existing records to have default image_position
UPDATE about_banner SET image_position = 'left' WHERE image_position IS NULL;
