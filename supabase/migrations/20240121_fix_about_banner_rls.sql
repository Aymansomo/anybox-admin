-- Drop existing RLS policies for about_banner
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON about_banner;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON about_banner;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON about_banner;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON about_banner;

-- Create new simplified RLS policies for about_banner
CREATE POLICY "Allow read access for all users" ON about_banner
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users" ON about_banner
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users" ON about_banner
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete for all users" ON about_banner
    FOR DELETE USING (true);
