DROP FUNCTION IF EXISTS public.get_booking_by_resume_token(text);

CREATE OR REPLACE FUNCTION public.get_booking_by_resume_token(_token text)
RETURNS TABLE (
  id uuid,
  apartment_id uuid,
  check_in date,
  check_out date,
  status booking_status,
  resume_token text,
  guest_name text,
  guest_last_name text,
  guest_email text,
  guest_phone text,
  guest_date_of_birth date,
  guest_place_of_birth text,
  guest_nationality text,
  guest_id_type text,
  guest_id_card_number text,
  guest_id_card_issued date,
  guest_id_card_expiry date,
  flight_outbound text,
  flight_return text,
  arrival_time text,
  departure_time text,
  airline text,
  no_transfer boolean,
  notes text,
  billing_name text,
  billing_address text,
  billing_city text,
  billing_zip text,
  billing_country text,
  billing_fiscal_code text,
  selected_services jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, apartment_id, check_in, check_out, status, resume_token,
    guest_name, guest_last_name, guest_email, guest_phone,
    guest_date_of_birth, guest_place_of_birth, guest_nationality,
    guest_id_type, guest_id_card_number, guest_id_card_issued, guest_id_card_expiry,
    flight_outbound, flight_return, arrival_time, departure_time, airline, no_transfer,
    notes,
    billing_name, billing_address, billing_city, billing_zip, billing_country, billing_fiscal_code,
    selected_services
  FROM public.bookings
  WHERE resume_token IS NOT NULL
    AND _token IS NOT NULL
    AND length(_token) >= 16
    AND resume_token = _token
    AND status = 'incomplete'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_resume_token(text) TO anon, authenticated;