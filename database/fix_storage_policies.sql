-- Fix Storage Policies - Allow uploads with anon key
-- This removes authentication requirement for storage

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can view layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their layout images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their layout images" ON storage.objects;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on layout images" ON storage.objects
    FOR ALL USING (bucket_id = 'layout-images');

-- Alternative: Disable RLS for storage objects (development only)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
