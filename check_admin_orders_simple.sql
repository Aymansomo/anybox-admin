-- Check the actual structure of admin_orders view
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test if the view works
SELECT COUNT(*) as total_orders FROM admin_orders;

-- Check if staff columns exist
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_orders' 
            AND column_name = 'staff_name'
        ) THEN 'staff_name exists'
        ELSE 'staff_name missing'
    END as staff_name_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_orders' 
            AND column_name = 'staff_email'
        ) THEN 'staff_email exists'
        ELSE 'staff_email missing'
    END as staff_email_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'admin_orders' 
            AND column_name = 'staff_role'
        ) THEN 'staff_role exists'
        ELSE 'staff_role missing'
    END as staff_role_status;
