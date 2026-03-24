
ALTER TABLE public.apartments ADD COLUMN check_in_time TEXT NOT NULL DEFAULT '15:00';
ALTER TABLE public.apartments ADD COLUMN check_out_time TEXT NOT NULL DEFAULT '10:00';
