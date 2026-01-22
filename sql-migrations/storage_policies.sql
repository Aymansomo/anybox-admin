-- =====================================================
-- Storage Policies for Category Images
-- =====================================================
-- Run this after creating the 'category-images' bucket in Supabase Dashboard
-- =====================================================

-- Allow public read access to category images
CREATE POLICY "Category images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'category-images');

-- Allow authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update category images
CREATE POLICY "Authenticated users can update category images" ON storage.objects
FOR UPDATE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete category images
CREATE POLICY "Authenticated users can delete category images" ON storage.objects
FOR DELETE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');
