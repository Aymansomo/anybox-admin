-- =====================================================
-- Simple RLS Fix for file_metadata Table Only
-- =====================================================
-- Run this in your Supabase SQL Editor to fix RLS issues
-- =====================================================

-- Disable RLS on file_metadata table
ALTER TABLE file_metadata DISABLE ROW LEVEL SECURITY;

-- Drop all policies on file_metadata table
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

-- Grant permissions to allow file operations
GRANT ALL ON file_metadata TO anon;
GRANT ALL ON file_metadata TO authenticated;

-- =====================================================
-- Verify RLS is disabled
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'file_metadata'
AND schemaname = 'public';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
