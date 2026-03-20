
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS airline text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS no_transfer boolean NOT NULL DEFAULT false;
