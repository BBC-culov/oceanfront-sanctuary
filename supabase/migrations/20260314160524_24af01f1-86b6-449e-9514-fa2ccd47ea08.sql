
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for maintenance check)
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT TO public USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default maintenance setting
INSERT INTO public.site_settings (key, value) VALUES ('maintenance_mode', '{"enabled": false, "message": "Stiamo effettuando una manutenzione programmata. Torneremo presto online!"}'::jsonb);
