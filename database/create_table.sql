-- Create Layout Items Table
-- Run this if the table doesn't exist

CREATE TABLE IF NOT EXISTS layout_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    image TEXT,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero_slider', 'image_text', 'banner', 'featured')),
    button_text VARCHAR(255),
    button_link TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE layout_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on layout items" ON layout_items
    FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_layout_items_section_type ON layout_items(section_type);
CREATE INDEX IF NOT EXISTS idx_layout_items_order_index ON layout_items(order_index);
CREATE INDEX IF NOT EXISTS idx_layout_items_is_active ON layout_items(is_active);

-- Test the table
SELECT * FROM layout_items LIMIT 1;
