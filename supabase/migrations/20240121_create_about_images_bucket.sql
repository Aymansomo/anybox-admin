-- Create storage bucket for about us images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'about-images',
  'about-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Set up RLS policies for the bucket
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
