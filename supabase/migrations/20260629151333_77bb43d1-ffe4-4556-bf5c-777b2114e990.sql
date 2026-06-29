
-- 1. Retention log table
CREATE TABLE public.data_retention_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  target_table TEXT NOT NULL,
  rows_affected INTEGER NOT NULL DEFAULT 0,
  details JSONB,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.data_retention_log TO authenticated;
GRANT ALL ON public.data_retention_log TO service_role;

ALTER TABLE public.data_retention_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view retention log"
ON public.data_retention_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_retention_log_executed_at ON public.data_retention_log(executed_at DESC);

-- 2. Retention cleanup function
CREATE OR REPLACE FUNCTION public.run_data_retention_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_incomplete_bookings INTEGER := 0;
  v_rejected_modifications INTEGER := 0;
  v_closed_inquiries INTEGER := 0;
  v_unsubscribe_tokens INTEGER := 0;
  v_email_logs INTEGER := 0;
  v_anonymized_guests INTEGER := 0;
  v_anonymized_main INTEGER := 0;
BEGIN
  -- a) Cancella prenotazioni incomplete > 30 giorni
  WITH deleted AS (
    DELETE FROM public.bookings
    WHERE status = 'incomplete'::booking_status
      AND created_at < now() - INTERVAL '30 days'
    RETURNING 1
  )
  SELECT count(*) INTO v_incomplete_bookings FROM deleted;

  -- b) Cancella richieste modifica rifiutate > 12 mesi
  WITH deleted AS (
    DELETE FROM public.booking_modification_requests
    WHERE status = 'rejected'
      AND created_at < now() - INTERVAL '12 months'
    RETURNING 1
  )
  SELECT count(*) INTO v_rejected_modifications FROM deleted;

  -- c) Cancella project_inquiries closed > 24 mesi
  WITH deleted AS (
    DELETE FROM public.project_inquiries
    WHERE status = 'closed'
      AND created_at < now() - INTERVAL '24 months'
    RETURNING 1
  )
  SELECT count(*) INTO v_closed_inquiries FROM deleted;

  -- d) Cancella token unsubscribe scaduti/usati
  WITH deleted AS (
    DELETE FROM public.email_unsubscribe_tokens
    WHERE (used_at IS NOT NULL AND used_at < now() - INTERVAL '7 days')
       OR (expires_at IS NOT NULL AND expires_at < now() - INTERVAL '7 days')
    RETURNING 1
  )
  SELECT count(*) INTO v_unsubscribe_tokens FROM deleted;

  -- e) Cancella email_send_log > 12 mesi
  WITH deleted AS (
    DELETE FROM public.email_send_log
    WHERE created_at < now() - INTERVAL '12 months'
    RETURNING 1
  )
  SELECT count(*) INTO v_email_logs FROM deleted;

  -- f) Anonimizza ospiti aggiuntivi di prenotazioni concluse > 24 mesi
  WITH updated AS (
    UPDATE public.booking_guests bg
    SET first_name = 'ANONYMIZED',
        last_name = 'ANONYMIZED',
        date_of_birth = NULL,
        place_of_birth = NULL,
        nationality = NULL,
        id_card_number = NULL,
        id_card_issued = NULL,
        id_card_expiry = NULL
    FROM public.bookings b
    WHERE bg.booking_id = b.id
      AND b.check_out < (now() - INTERVAL '24 months')::date
      AND bg.first_name <> 'ANONYMIZED'
    RETURNING 1
  )
  SELECT count(*) INTO v_anonymized_guests FROM updated;

  -- g) Anonimizza dati ospite principale di prenotazioni concluse > 24 mesi
  --    (mantiene billing_* e booking_code per obbligo fiscale 10 anni)
  WITH updated AS (
    UPDATE public.bookings
    SET guest_date_of_birth = NULL,
        guest_place_of_birth = NULL,
        guest_id_card_number = NULL,
        guest_id_card_issued = NULL,
        guest_id_card_expiry = NULL,
        guest_phone = NULL,
        flight_outbound = NULL,
        flight_return = NULL,
        airline = NULL
    WHERE check_out < (now() - INTERVAL '24 months')::date
      AND status IN ('completed'::booking_status, 'cancelled'::booking_status, 'confirmed'::booking_status)
      AND guest_id_card_number IS NOT NULL
    RETURNING 1
  )
  SELECT count(*) INTO v_anonymized_main FROM updated;

  -- Log
  INSERT INTO public.data_retention_log (operation, target_table, rows_affected, details) VALUES
    ('delete', 'bookings', v_incomplete_bookings, jsonb_build_object('reason', 'incomplete > 30 days')),
    ('delete', 'booking_modification_requests', v_rejected_modifications, jsonb_build_object('reason', 'rejected > 12 months')),
    ('delete', 'project_inquiries', v_closed_inquiries, jsonb_build_object('reason', 'closed > 24 months')),
    ('delete', 'email_unsubscribe_tokens', v_unsubscribe_tokens, jsonb_build_object('reason', 'used/expired > 7 days')),
    ('delete', 'email_send_log', v_email_logs, jsonb_build_object('reason', '> 12 months')),
    ('anonymize', 'booking_guests', v_anonymized_guests, jsonb_build_object('reason', 'check_out > 24 months')),
    ('anonymize', 'bookings', v_anonymized_main, jsonb_build_object('reason', 'check_out > 24 months, fiscal data preserved'));

  RETURN jsonb_build_object(
    'ok', true,
    'executed_at', now(),
    'results', jsonb_build_object(
      'incomplete_bookings_deleted', v_incomplete_bookings,
      'rejected_modifications_deleted', v_rejected_modifications,
      'closed_inquiries_deleted', v_closed_inquiries,
      'unsubscribe_tokens_deleted', v_unsubscribe_tokens,
      'email_logs_deleted', v_email_logs,
      'guests_anonymized', v_anonymized_guests,
      'main_guests_anonymized', v_anonymized_main
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.run_data_retention_cleanup() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_data_retention_cleanup() TO service_role;

-- 3. Schedule daily at 03:30 UTC via pg_cron
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Unschedule if exists
    PERFORM cron.unschedule('data-retention-cleanup')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'data-retention-cleanup');

    PERFORM cron.schedule(
      'data-retention-cleanup',
      '30 3 * * *',
      $cron$ SELECT public.run_data_retention_cleanup(); $cron$
    );
  END IF;
END $$;
