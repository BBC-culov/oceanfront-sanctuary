ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS balance_payment_url text,
ADD COLUMN IF NOT EXISTS balance_session_id text,
ADD COLUMN IF NOT EXISTS balance_link_expires_at bigint;