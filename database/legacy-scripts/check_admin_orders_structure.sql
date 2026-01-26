-- Check the actual structure of admin_orders view
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the view exists and what it looks like
SELECT definition 
FROM information_schema.views 
WHERE table_name = 'admin_orders' 
AND table_schema = 'public';
