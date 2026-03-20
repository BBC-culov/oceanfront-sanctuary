
-- Extend bookings table with flight, billing, and service data
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guest_last_name text,
  ADD COLUMN IF NOT EXISTS guest_date_of_birth date,
  ADD COLUMN IF NOT EXISTS guest_place_of_birth text,
  ADD COLUMN IF NOT EXISTS guest_nationality text,
  ADD COLUMN IF NOT EXISTS guest_id_card_number text,
  ADD COLUMN IF NOT EXISTS guest_id_card_issued date,
  ADD COLUMN IF NOT EXISTS guest_id_card_expiry date,
  ADD COLUMN IF NOT EXISTS flight_outbound text,
  ADD COLUMN IF NOT EXISTS flight_return text,
  ADD COLUMN IF NOT EXISTS arrival_time text,
  ADD COLUMN IF NOT EXISTS departure_time text,
  ADD COLUMN IF NOT EXISTS billing_name text,
  ADD COLUMN IF NOT EXISTS billing_address text,
  ADD COLUMN IF NOT EXISTS billing_city text,
  ADD COLUMN IF NOT EXISTS billing_zip text,
  ADD COLUMN IF NOT EXISTS billing_country text,
  ADD COLUMN IF NOT EXISTS billing_fiscal_code text,
  ADD COLUMN IF NOT EXISTS selected_services jsonb DEFAULT '[]'::jsonb;

-- Create booking_guests table for additional guests
CREATE TABLE public.booking_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  nationality text NOT NULL,
  id_card_number text NOT NULL,
  id_card_issued date NOT NULL,
  id_card_expiry date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;

-- RLS: admins can manage all
CREATE POLICY "Admins can manage booking guests"
  ON public.booking_guests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS: users can manage guests for their own bookings
CREATE POLICY "Users can manage own booking guests"
  ON public.booking_guests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_guests.booking_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_guests.booking_id
        AND b.user_id = auth.uid()
    )
  );

-- Create additional_services reference table
CREATE TABLE public.additional_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON public.additional_services FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON public.additional_services FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert some default additional services
INSERT INTO public.additional_services (name, description, price, sort_order) VALUES
  ('Transfer aeroporto A/R', 'Servizio transfer da/per aeroporto Rabil', 40, 1),
  ('Kit benvenuto', 'Cesto con prodotti locali e bevande fresche', 25, 2),
  ('Escursione in barca', 'Tour in barca lungo la costa di Boa Vista', 65, 3),
  ('Noleggio auto', 'Auto a noleggio per l''intera durata del soggiorno (al giorno)', 35, 4),
  ('Pulizia extra', 'Servizio di pulizia aggiuntivo durante il soggiorno', 20, 5),
  ('Chef privato', 'Cena preparata da uno chef locale a domicilio', 80, 6);
