
-- 1. Replace permissive WITH CHECK (true) on project_inquiries with real validation
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.project_inquiries;

CREATE POLICY "Anyone can submit inquiries"
  ON public.project_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 120
    AND length(btrim(message)) BETWEEN 1 AND 5000
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND (phone IS NULL OR length(phone) <= 30)
  );

-- 2. Admin-only SELECT policy for the private project-media bucket
DROP POLICY IF EXISTS "Admins can read project-media" ON storage.objects;
CREATE POLICY "Admins can read project-media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-media'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins can write project-media" ON storage.objects;
CREATE POLICY "Admins can write project-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-media'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins can update project-media" ON storage.objects;
CREATE POLICY "Admins can update project-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-media'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admins can delete project-media" ON storage.objects;
CREATE POLICY "Admins can delete project-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-media'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );
