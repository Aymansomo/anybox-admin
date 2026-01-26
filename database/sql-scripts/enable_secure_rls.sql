-- =====================================================
-- Enable Proper RLS Policies for Storage Tables
-- =====================================================
-- Run this in your Supabase SQL Editor to secure storage access
-- =====================================================

-- Enable RLS on storage tables
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all views" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes" ON storage.objects;

-- Create secure bucket policies
CREATE POLICY "Users can view buckets" ON storage.buckets FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert buckets" ON storage.buckets FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  bucket = 'uploads'
);

-- Create secure object policies
CREATE POLICY "Public images are viewable by everyone" ON storage.objects FOR SELECT USING (
  bucket_id IN ('uploads', 'category-images') AND
  (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Authenticated users can upload to uploads bucket" ON storage.objects FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'uploads'
);

CREATE POLICY "Users can update their own uploads" ON storage.objects FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE USING (
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant proper permissions
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE ON storage.objects TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('buckets', 'objects')
AND schemaname = 'storage';

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('buckets', 'objects')
AND schemaname = 'storage';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
