-- =====================================================
-- Create Uploads Bucket and Disable RLS
-- =====================================================
-- Run this in your Supabase SQL Editor to fix storage issues
-- =====================================================

-- Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'uploads', 
    'uploads', 
    true, 
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- NOTE:
-- Do NOT disable RLS on storage.objects. In Supabase you typically keep RLS enabled
-- and add policies that control access per bucket.

-- Drop any existing policies with the same names (safe if they don't exist)
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete uploads" ON storage.objects;

-- Public read (so images can be shown on the website/admin)
CREATE POLICY "Public read uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- Authenticated users can upload into uploads bucket
CREATE POLICY "Authenticated upload to uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update objects in uploads bucket
CREATE POLICY "Authenticated update uploads"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete objects in uploads bucket
CREATE POLICY "Authenticated delete uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- Verify bucket exists
-- =====================================================
SELECT * FROM storage.buckets WHERE id = 'uploads';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
