DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Superadmin can delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'amministratore'));
CREATE POLICY "Superadmin can update roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'amministratore'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'amministratore'));

CREATE OR REPLACE FUNCTION public.run_data_retention_cleanup()
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_incomplete_bookings INTEGER := 0; v_rejected_modifications INTEGER := 0;
  v_closed_inquiries INTEGER := 0; v_unsubscribe_tokens INTEGER := 0;
  v_email_logs INTEGER := 0; v_anonymized_guests INTEGER := 0; v_anonymized_main INTEGER := 0;
BEGIN
  WITH d AS (DELETE FROM public.bookings WHERE status = 'incomplete'::booking_status AND created_at < now() - INTERVAL '30 days' RETURNING 1)
  SELECT count(*) INTO v_incomplete_bookings FROM d;
  WITH d AS (DELETE FROM public.booking_modification_requests WHERE status = 'rejected' AND created_at < now() - INTERVAL '12 months' RETURNING 1)
  SELECT count(*) INTO v_rejected_modifications FROM d;
  WITH d AS (DELETE FROM public.project_inquiries WHERE status = 'closed' AND created_at < now() - INTERVAL '24 months' RETURNING 1)
  SELECT count(*) INTO v_closed_inquiries FROM d;
  WITH d AS (DELETE FROM public.email_unsubscribe_tokens WHERE used_at IS NOT NULL AND used_at < now() - INTERVAL '7 days' RETURNING 1)
  SELECT count(*) INTO v_unsubscribe_tokens FROM d;
  WITH d AS (DELETE FROM public.email_send_log WHERE created_at < now() - INTERVAL '12 months' RETURNING 1)
  SELECT count(*) INTO v_email_logs FROM d;

  WITH u AS (
    UPDATE public.booking_guests bg
    SET first_name = 'ANONYMIZED', last_name = 'ANONYMIZED',
        date_of_birth = DATE '1900-01-01', nationality = 'ANONYMIZED',
        id_card_number = '00000000', id_card_issued = DATE '1900-01-01', id_card_expiry = DATE '1900-01-01'
    FROM public.bookings b
    WHERE bg.booking_id = b.id AND b.check_out < (now() - INTERVAL '24 months')::date AND bg.first_name <> 'ANONYMIZED'
    RETURNING 1)
  SELECT count(*) INTO v_anonymized_guests FROM u;

  WITH u AS (
    UPDATE public.bookings
    SET guest_date_of_birth = NULL, guest_place_of_birth = NULL, guest_id_card_number = NULL,
        guest_id_card_issued = NULL, guest_id_card_expiry = NULL, guest_phone = NULL,
        flight_outbound = NULL, flight_return = NULL, airline = NULL
    WHERE check_out < (now() - INTERVAL '24 months')::date
      AND status IN ('cancelled'::booking_status, 'confirmed'::booking_status, 'paid'::booking_status)
      AND guest_id_card_number IS NOT NULL
    RETURNING 1)
  SELECT count(*) INTO v_anonymized_main FROM u;

  INSERT INTO public.data_retention_log (operation, target_table, rows_affected, details) VALUES
    ('delete','bookings',v_incomplete_bookings,jsonb_build_object('reason','incomplete > 30 days')),
    ('delete','booking_modification_requests',v_rejected_modifications,jsonb_build_object('reason','rejected > 12 months')),
    ('delete','project_inquiries',v_closed_inquiries,jsonb_build_object('reason','closed > 24 months')),
    ('delete','email_unsubscribe_tokens',v_unsubscribe_tokens,jsonb_build_object('reason','used > 7 days')),
    ('delete','email_send_log',v_email_logs,jsonb_build_object('reason','> 12 months')),
    ('anonymize','booking_guests',v_anonymized_guests,jsonb_build_object('reason','check_out > 24 months')),
    ('anonymize','bookings',v_anonymized_main,jsonb_build_object('reason','check_out > 24 months, fiscal data preserved'));

  RETURN jsonb_build_object('ok', true, 'executed_at', now(), 'results', jsonb_build_object(
    'incomplete_bookings_deleted', v_incomplete_bookings, 'rejected_modifications_deleted', v_rejected_modifications,
    'closed_inquiries_deleted', v_closed_inquiries, 'unsubscribe_tokens_deleted', v_unsubscribe_tokens,
    'email_logs_deleted', v_email_logs, 'guests_anonymized', v_anonymized_guests, 'main_guests_anonymized', v_anonymized_main));
END;
$function$;