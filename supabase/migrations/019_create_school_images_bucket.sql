-- Create storage bucket for school images
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-images', 'school-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for school-images bucket
-- Allow public read access
CREATE POLICY "Public can view school images"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload school images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update school images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'school-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete school images"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-images' AND auth.role() = 'authenticated');