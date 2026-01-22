-- Setup Storage Bucket and Policies
-- Run this step by step in Supabase SQL Editor

-- Step 1: Create storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('layout-images', 'layout-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop all existing storage policies for this bucket
DROP POLICY IF EXISTS "Anyone can view layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their layout images" ON storage.objects;

-- Step 3: Create simple storage policies
CREATE POLICY "Public view access to layout images" ON storage.objects
    FOR SELECT USING (bucket_id = 'layout-images');

CREATE POLICY "Insert access to layout images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'layout-images');

CREATE POLICY "Update access to layout images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'layout-images');

CREATE POLICY "Delete access to layout images" ON storage.objects
    FOR DELETE USING (bucket_id = 'layout-images');

-- Step 4: Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'layout-images';
