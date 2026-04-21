ALTER TABLE public.apartments
  ADD COLUMN IF NOT EXISTS owner_id uuid;

CREATE INDEX IF NOT EXISTS idx_apartments_owner_id ON public.apartments(owner_id);

DROP POLICY IF EXISTS "Proprietari can view own apartments" ON public.apartments;
CREATE POLICY "Proprietari can view own apartments"
ON public.apartments
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  AND public.has_role(auth.uid(), 'proprietario'::app_role)
);