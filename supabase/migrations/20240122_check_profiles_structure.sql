-- Check what's actually in your profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there's any data in profiles
SELECT COUNT(*) as profile_count FROM profiles;

-- If there's data, show a sample
SELECT * FROM profiles LIMIT 3;
