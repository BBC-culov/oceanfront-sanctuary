
ALTER TABLE public.bookings ADD COLUMN guest_id_type text DEFAULT 'id_card';
ALTER TABLE public.booking_guests ADD COLUMN id_type text NOT NULL DEFAULT 'id_card';
