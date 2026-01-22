-- =====================================================
-- Fix Storage RLS Policies for System Uploads
-- =====================================================
-- Run this in your Supabase SQL Editor to fix RLS issues
-- =====================================================

-- Disable RLS entirely for testing (less secure but will work)
ALTER TABLE file_metadata DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies:
-- Drop all existing policies safely
DO $$
BEGIN
    -- Drop all existing policies on file_metadata table
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
END $$;

-- Create permissive policies for testing
CREATE POLICY "Allow all uploads" ON file_metadata FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all views" ON file_metadata FOR SELECT USING (true);
CREATE POLICY "Allow all updates" ON file_metadata FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON file_metadata FOR DELETE USING (true);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
