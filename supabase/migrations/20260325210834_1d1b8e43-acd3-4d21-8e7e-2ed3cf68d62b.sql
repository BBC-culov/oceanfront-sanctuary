
-- Re-add public read for site_settings but only for the maintenance_mode key
-- This ensures unauthenticated users can check maintenance status
DROP POLICY IF EXISTS "Authenticated users can read site settings" ON public.site_settings;

-- Admins and authenticated users can read all settings
CREATE POLICY "Authenticated can read site settings"
ON public.site_settings FOR SELECT TO authenticated
USING (true);

-- Public (anon) can only read maintenance_mode
CREATE POLICY "Public can read maintenance mode"
ON public.site_settings FOR SELECT TO anon
USING (key = 'maintenance_mode');
