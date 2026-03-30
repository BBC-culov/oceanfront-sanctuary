
-- Restrict authenticated users to only read non-sensitive site_settings keys
DROP POLICY IF EXISTS "Authenticated can read site settings" ON public.site_settings;

CREATE POLICY "Authenticated can read public site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (key IN ('maintenance_mode'));
