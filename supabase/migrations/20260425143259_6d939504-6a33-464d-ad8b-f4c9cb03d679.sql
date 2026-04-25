ALTER TABLE public.apartments
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 999,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_apartments_order ON public.apartments(is_featured DESC, display_order ASC);

-- Backfill display_order based on current name order so we have a sensible starting point
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) * 10 AS rn
  FROM public.apartments
)
UPDATE public.apartments a
SET display_order = o.rn
FROM ordered o
WHERE a.id = o.id AND a.display_order = 999;