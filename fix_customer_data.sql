-- First, let's check what profiles exist and what user_ids we have
-- This will help us understand the data structure

-- Step 1: Check if profiles table exists and show its structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 2: Show existing profiles (using first_name and last_name)
SELECT id, first_name, last_name, email FROM profiles LIMIT 10;

-- Step 3: Show the user_ids from orders that need profiles
SELECT DISTINCT user_id, COUNT(*) as order_count 
FROM orders 
WHERE user_id IS NOT NULL 
GROUP BY user_id;

-- Step 4: Create sample profiles for the missing user_ids if they don't exist
-- We will use first_name and last_name instead of 'name'
INSERT INTO profiles (id, first_name, last_name, email, created_at, updated_at)
SELECT 
    user_id,
    'Customer' AS first_name, -- Default first name
    ROW_NUMBER() OVER (ORDER BY user_id)::text AS last_name, -- Unique last name
    'customer' || ROW_NUMBER() OVER (ORDER BY user_id) || '@example.com' AS email,
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT user_id 
    FROM orders 
    WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
) AS missing_users;

-- Step 5: Update orders to use the profile id as customer_id (for compatibility)
-- Since customer_id is bigint and user_id is uuid, we need to handle this differently
-- Option 1: If you want to store the UUID as text in customer_id, you'd need to alter the column type
-- Option 2: Create a mapping table between orders and profiles
-- Option 3: For now, let's just verify what we have without updating customer_id

-- For now, let's skip the update and just verify the data
-- UPDATE orders 
-- SET customer_id = user_id::text 
-- WHERE user_id IS NOT NULL 
-- AND customer_id IS NULL;

-- Step 6: Verify the fix (without relying on customer_id)
SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.customer_id,
    p.first_name || ' ' || p.last_name as customer_name,
    p.email as customer_email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE o.staff_id = 5
ORDER BY o.created_at DESC;
