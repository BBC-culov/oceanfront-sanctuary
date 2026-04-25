-- Remove overly permissive policy that exposed all incomplete bookings publicly
DROP POLICY IF EXISTS "Public can read booking by resume_token" ON public.bookings;

-- Secure RPC: returns booking only if exact resume_token is provided
CREATE OR REPLACE FUNCTION public.get_booking_by_resume_token(_token text)
RETURNS TABLE (
  id uuid,
  apartment_id uuid,
  check_in date,
  check_out date,
  guest_name text,
  guest_last_name text,
  guest_email text,
  status booking_status,
  resume_token text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, apartment_id, check_in, check_out, guest_name, guest_last_name, guest_email, status, resume_token
  FROM public.bookings
  WHERE resume_token IS NOT NULL
    AND _token IS NOT NULL
    AND length(_token) >= 16
    AND resume_token = _token
    AND status = 'incomplete'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_resume_token(text) TO anon, authenticated;