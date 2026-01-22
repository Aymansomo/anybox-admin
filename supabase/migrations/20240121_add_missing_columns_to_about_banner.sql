-- Add missing columns to about_banner table
ALTER TABLE about_banner 
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS vision TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- Update existing records to have default order_index
UPDATE about_banner SET order_index = 0 WHERE order_index IS NULL;
