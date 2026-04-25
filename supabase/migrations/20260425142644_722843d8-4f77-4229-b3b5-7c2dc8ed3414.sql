-- Apartment availability blocks for admin manual blocking
CREATE TABLE public.apartment_availability_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT availability_block_date_order CHECK (end_date >= start_date)
);

CREATE INDEX idx_availability_blocks_apartment ON public.apartment_availability_blocks(apartment_id);
CREATE INDEX idx_availability_blocks_dates ON public.apartment_availability_blocks(start_date, end_date);

ALTER TABLE public.apartment_availability_blocks ENABLE ROW LEVEL SECURITY;

-- Public can read blocks (needed for booking calendar to show unavailability)
CREATE POLICY "Anyone can view availability blocks"
ON public.apartment_availability_blocks
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage blocks
CREATE POLICY "Admins can manage availability blocks"
ON public.apartment_availability_blocks
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_availability_blocks_updated_at
BEFORE UPDATE ON public.apartment_availability_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();