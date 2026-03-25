
-- Restrict site_settings to authenticated users only (remove public read)
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;

CREATE POLICY "Authenticated users can read site settings"
ON public.site_settings FOR SELECT TO authenticated
USING (true);
