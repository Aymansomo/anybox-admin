-- Layout Items Table Schema
-- This table stores all layout elements like hero sliders, banners, image-text sections, etc.

CREATE TABLE IF NOT EXISTS layout_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    image TEXT, -- URL to the uploaded image
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero_slider', 'image_text', 'banner', 'featured')),
    button_text VARCHAR(255),
    button_link TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_layout_items_section_type ON layout_items(section_type);
CREATE INDEX IF NOT EXISTS idx_layout_items_order_index ON layout_items(order_index);
CREATE INDEX IF NOT EXISTS idx_layout_items_is_active ON layout_items(is_active);

-- Storage bucket for layout images
-- This should be created in Supabase dashboard or via SQL:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('layout-images', 'layout-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) policies for layout items
ALTER TABLE layout_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read layout items
CREATE POLICY "Authenticated users can view layout items" ON layout_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow admin users to insert layout items
CREATE POLICY "Admin users can insert layout items" ON layout_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow admin users to update layout items
CREATE POLICY "Admin users can update layout items" ON layout_items
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Allow admin users to delete layout items
CREATE POLICY "Admin users can delete layout items" ON layout_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies for layout images
CREATE POLICY "Anyone can view layout images" ON storage.objects
    FOR SELECT USING (bucket_id = 'layout-images');

CREATE POLICY "Authenticated users can upload layout images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'layout-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update their layout images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'layout-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete their layout images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'layout-images' AND 
        auth.role() = 'authenticated'
    );

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_layout_items_updated_at 
    BEFORE UPDATE ON layout_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
