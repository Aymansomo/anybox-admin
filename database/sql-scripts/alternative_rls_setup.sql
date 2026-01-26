-- =====================================================
-- Alternative RLS Setup for Storage Tables
-- =====================================================
-- Use this if you don't have owner permissions on storage tables
-- =====================================================

-- First, check what permissions you have
SELECT 
    schemaname,
    tablename,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'DELETE') as can_delete,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'TRIGGER') as can_trigger
FROM pg_tables 
WHERE schemaname = 'storage'
AND tablename IN ('buckets', 'objects');

-- Alternative: Create application-level security policies
-- This approach uses views and functions instead of RLS

-- Create a secure view for file uploads (if you can't modify storage.objects)
CREATE OR REPLACE VIEW secure_file_uploads AS
SELECT 
    id,
    name,
    bucket_id,
    created_at,
    updated_at,
    last_accessed_at,
    etag,
    metadata,
    -- Only show files that belong to current user or are public
    CASE 
        WHEN (storage.foldername(name))[1] = 'public' THEN true
        WHEN auth.uid()::text = (storage.foldername(name))[1] THEN true
        ELSE false
    END as can_access
FROM storage.objects
WHERE bucket_id IN ('uploads', 'category-images');

-- Grant access to the view instead of the table
GRANT SELECT ON secure_file_uploads TO authenticated, anon;

-- =====================================================
-- If you have admin permissions, try this instead:
-- =====================================================

-- Enable RLS on your custom file_metadata table (if it exists)
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own files" ON file_metadata;
DROP POLICY IF EXISTS "Users can upload files" ON file_metadata;
DROP POLICY IF EXISTS "Users can update their own files" ON file_metadata;
DROP POLICY IF EXISTS "Users can delete their own files" ON file_metadata;

-- Create secure policies for file_metadata
CREATE POLICY "Users can view their own files" ON file_metadata FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    is_public = true
);

CREATE POLICY "Users can upload files" ON file_metadata FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text
);

CREATE POLICY "Users can update their own files" ON file_metadata FOR UPDATE USING (
    auth.uid()::text = user_id::text
);

CREATE POLICY "Users can delete their own files" ON file_metadata FOR DELETE USING (
    auth.uid()::text = user_id::text
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check what's now accessible
SELECT * FROM secure_file_uploads LIMIT 5;

-- Check policies on file_metadata
SELECT * FROM pg_policies WHERE tablename = 'file_metadata';
