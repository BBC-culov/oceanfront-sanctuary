
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS videos jsonb DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public)
VALUES ('apartment-videos', 'apartment-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view apartment videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apartment-videos');

CREATE POLICY "Admins can manage apartment videos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'apartment-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'apartment-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
