-- =====================================================
-- Storage Policies Update for Category Images
-- =====================================================
-- This script drops existing policies and recreates them
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Category images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete category images" ON storage.objects;

-- Create new policies with proper permissions

-- Allow public read access to category images
CREATE POLICY "Category images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'category-images');

-- Allow all users to upload category images (for admin panel)
CREATE POLICY "Anyone can upload category images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'category-images');

-- Allow all users to update category images (for admin panel)
CREATE POLICY "Anyone can update category images" ON storage.objects
FOR UPDATE USING (bucket_id = 'category-images');

-- Allow all users to delete category images (for admin panel)
CREATE POLICY "Anyone can delete category images" ON storage.objects
FOR DELETE USING (bucket_id = 'category-images');
