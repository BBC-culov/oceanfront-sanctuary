
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS amount_paid numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric NOT NULL DEFAULT 0;
