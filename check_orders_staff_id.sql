-- Check if staff_id column exists in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND table_schema = 'public'
AND column_name = 'staff_id';
