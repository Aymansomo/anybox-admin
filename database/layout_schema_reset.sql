-- Reset Layout Items Schema
-- This script drops existing policies and recreates them

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view layout items" ON layout_items;
DROP POLICY IF EXISTS "Admin users can insert layout items" ON layout_items;
DROP POLICY IF EXISTS "Admin users can update layout items" ON layout_items;
DROP POLICY IF EXISTS "Admin users can delete layout items" ON layout_items;

-- Drop storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their layout images" ON storage.objects;

-- Recreate policies for layout items
CREATE POLICY "Authenticated users can view layout items" ON layout_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert layout items" ON layout_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin users can update layout items" ON layout_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can delete layout items" ON layout_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Recreate storage policies for layout images
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
