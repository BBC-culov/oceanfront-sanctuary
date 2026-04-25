-- Fase 4: Recupero prenotazioni non completate
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS resume_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS recovery_email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_resume_token ON public.bookings(resume_token) WHERE resume_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_incomplete ON public.bookings(status, created_at) WHERE status = 'incomplete';

-- Allow public lookup of an incomplete booking by its resume token (read-only, single row).
-- The token itself is the secret (32+ chars random) so this is safe.
CREATE POLICY "Public can read booking by resume_token"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (resume_token IS NOT NULL AND status = 'incomplete');