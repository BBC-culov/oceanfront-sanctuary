
-- Add modification payment columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS modification_amount_due numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS modification_payment_url text,
  ADD COLUMN IF NOT EXISTS modification_session_id text,
  ADD COLUMN IF NOT EXISTS modification_link_expires_at bigint;

CREATE TABLE IF NOT EXISTS public.booking_modification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  current_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_total numeric NOT NULL DEFAULT 0,
  new_total numeric NOT NULL DEFAULT 0,
  price_diff numeric NOT NULL DEFAULT 0,
  customer_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_note text,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS booking_mod_requests_one_pending
  ON public.booking_modification_requests(booking_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS booking_mod_requests_booking_idx
  ON public.booking_modification_requests(booking_id);

DROP TRIGGER IF EXISTS booking_mod_requests_updated_at ON public.booking_modification_requests;
CREATE TRIGGER booking_mod_requests_updated_at
  BEFORE UPDATE ON public.booking_modification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.booking_modification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage all modification requests" ON public.booking_modification_requests;
CREATE POLICY "Admins manage all modification requests"
  ON public.booking_modification_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own modification requests" ON public.booking_modification_requests;
CREATE POLICY "Users can view own modification requests"
  ON public.booking_modification_requests FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_modification_requests.booking_id AND b.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create modification requests on own bookings" ON public.booking_modification_requests;
CREATE POLICY "Users can create modification requests on own bookings"
  ON public.booking_modification_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_modification_requests.booking_id
        AND b.user_id = auth.uid()
        AND b.status::text IN ('confirmed','awaiting_verification','paid','modification_pending')
    )
  );

DROP POLICY IF EXISTS "Users can cancel own pending requests" ON public.booking_modification_requests;
CREATE POLICY "Users can cancel own pending requests"
  ON public.booking_modification_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (status = 'cancelled');
