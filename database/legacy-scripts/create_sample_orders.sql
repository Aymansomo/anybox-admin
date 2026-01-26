-- Since you're using profiles instead of customers, let's work with that
-- First, let's see what profiles exist and update orders accordingly

-- If you have a profiles table, this will create sample profiles
-- Adjust the column names based on your actual profile table structure
DO $$
BEGIN
    -- Check if profiles table exists and create sample profiles if needed
    -- This assumes your profiles table has columns like: id, name, email
    
    -- Update existing orders to link to existing profiles
    -- This will assign the first available profile to order ID 18
    UPDATE orders 
    SET customer_id = (SELECT id FROM profiles LIMIT 1) 
    WHERE id = 18 AND customer_id IS NULL;
    
    -- If you have multiple profiles, assign them to other orders too
    UPDATE orders 
    SET customer_id = (SELECT id FROM profiles OFFSET 1 LIMIT 1) 
    WHERE id != 18 AND customer_id IS NULL LIMIT 1;
    
    UPDATE orders 
    SET customer_id = (SELECT id FROM profiles OFFSET 2 LIMIT 1) 
    WHERE id != 18 AND customer_id IS NULL LIMIT 1;
END $$;
