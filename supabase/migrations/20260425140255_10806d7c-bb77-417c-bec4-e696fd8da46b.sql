-- Add new booking status values
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'awaiting_verification';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'incomplete';

-- Create manual_payments table for offline payment tracking
CREATE TABLE IF NOT EXISTS public.manual_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('cash', 'on_arrival', 'bank_transfer', 'other')),
  custom_method TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_payments_booking_id ON public.manual_payments(booking_id);

ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage manual payments"
ON public.manual_payments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own manual payments"
ON public.manual_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = manual_payments.booking_id
      AND b.user_id = auth.uid()
  )
);
