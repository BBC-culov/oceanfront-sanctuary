
-- Add booking_code column
ALTER TABLE public.bookings ADD COLUMN booking_code TEXT UNIQUE;

-- Function to generate unique alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-char alphanumeric code (uppercase)
    new_code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
    -- Check uniqueness
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE booking_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.booking_code := new_code;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate code on insert
CREATE TRIGGER trg_generate_booking_code
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL)
  EXECUTE FUNCTION public.generate_booking_code();

-- Backfill existing bookings
UPDATE public.bookings SET booking_code = upper(substr(md5(id::text), 1, 8)) WHERE booking_code IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE public.bookings ALTER COLUMN booking_code SET NOT NULL;
