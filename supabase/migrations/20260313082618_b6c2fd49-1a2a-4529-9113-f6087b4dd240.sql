
-- Create storage bucket for apartment images
INSERT INTO storage.buckets (id, name, public)
VALUES ('apartment-images', 'apartment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload files
CREATE POLICY "Admins can upload apartment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'apartment-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update files
CREATE POLICY "Admins can update apartment images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'apartment-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete apartment images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'apartment-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow public read access
CREATE POLICY "Anyone can view apartment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apartment-images');
