-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view about images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload about images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update about images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete about images" ON storage.objects;

-- Create new simplified RLS policies for the bucket
CREATE POLICY "Anyone can view about images"
ON storage.objects FOR SELECT
USING (bucket_id = 'about-images');

CREATE POLICY "Authenticated users can upload about images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'about-images'
);

CREATE POLICY "Authenticated users can update about images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'about-images'
);

CREATE POLICY "Authenticated users can delete about images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'about-images'
);
