
-- Remove sensitive tables from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime DROP TABLE public.site_settings;
