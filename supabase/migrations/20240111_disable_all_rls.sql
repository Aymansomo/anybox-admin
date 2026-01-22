-- =====================================================
-- Disable RLS on All Storage-Related Tables
-- =====================================================
-- Run this in your Supabase SQL Editor to completely disable RLS
-- =====================================================

-- Disable RLS on file_metadata table
ALTER TABLE file_metadata DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on storage schema tables if they exist
DO $$
BEGIN
    -- Check if storage.buckets exists and disable RLS
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buckets' AND table_schema = 'storage') THEN
        ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Check if storage.objects exists and disable RLS  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'objects' AND table_schema = 'storage') THEN
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Drop all policies on file_metadata
    DROP POLICY IF EXISTS "Users can upload files" ON file_metadata;
    DROP POLICY IF EXISTS "System can upload files" ON file_metadata;
    DROP POLICY IF EXISTS "Users can view their own files" ON file_metadata;
    DROP POLICY IF EXISTS "System can view files" ON file_metadata;
    DROP POLICY IF EXISTS "Users can update their own files" ON file_metadata;
    DROP POLICY IF EXISTS "System can update files" ON file_metadata;
    DROP POLICY IF EXISTS "Users can delete their own files" ON file_metadata;
    DROP POLICY IF EXISTS "System can delete files" ON file_metadata;
    DROP POLICY IF EXISTS "Public files are viewable by everyone" ON file_metadata;
    DROP POLICY IF EXISTS "Allow all uploads" ON file_metadata;
    DROP POLICY IF EXISTS "Allow all views" ON file_metadata;
    DROP POLICY IF EXISTS "Allow all updates" ON file_metadata;
    DROP POLICY IF EXISTS "Allow all deletes" ON file_metadata;
    
    -- Drop any storage policies
    DROP POLICY IF EXISTS "Anyone can view buckets" ON storage.buckets;
    DROP POLICY IF EXISTS "Anyone can upload objects" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view objects" ON storage.objects;
END $$;

-- Grant public access to storage
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- =====================================================
-- Verify RLS is disabled
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('file_metadata', 'buckets', 'objects')
AND schemaname IN ('public', 'storage');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
