-- Check current admin_orders view structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;
