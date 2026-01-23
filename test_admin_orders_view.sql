-- Test the admin_orders view to see if it works
SELECT * FROM admin_orders LIMIT 1;

-- Check if staff_id column exists and has proper data
SELECT 
    id,
    order_number,
    staff_id,
    staff_name,
    staff_email,
    staff_role
FROM admin_orders 
WHERE staff_id IS NOT NULL 
LIMIT 5;

-- Check for any undefined or null values
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN staff_id IS NULL THEN 1 END) as null_staff_id,
    COUNT(CASE WHEN staff_id IS NOT NULL THEN 1 END) as has_staff_id
FROM admin_orders;
