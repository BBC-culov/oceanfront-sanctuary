
-- Security definer helper: is the user the owner of the apartment?
CREATE OR REPLACE FUNCTION public.is_apartment_owner(_user_id uuid, _apartment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.apartments
    WHERE id = _apartment_id
      AND owner_id = _user_id
  )
$$;

-- Proprietario can view bookings of their own apartments
DROP POLICY IF EXISTS "Proprietari can view bookings of own apartments" ON public.bookings;
CREATE POLICY "Proprietari can view bookings of own apartments"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'proprietario'::app_role)
  AND public.is_apartment_owner(auth.uid(), apartment_id)
);

-- Proprietario can manage availability blocks on their own apartments
DROP POLICY IF EXISTS "Proprietari can manage own availability blocks" ON public.apartment_availability_blocks;
CREATE POLICY "Proprietari can manage own availability blocks"
ON public.apartment_availability_blocks
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'proprietario'::app_role)
  AND public.is_apartment_owner(auth.uid(), apartment_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'proprietario'::app_role)
  AND public.is_apartment_owner(auth.uid(), apartment_id)
);
