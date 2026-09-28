CREATE OR REPLACE FUNCTION public.prevent_user_booking_field_tampering()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  -- Service role (no auth.uid) and admins bypass
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admin users may never change pricing / payment / identity-of-booking fields
  IF NEW.total_price        IS DISTINCT FROM OLD.total_price        OR
     NEW.amount_paid        IS DISTINCT FROM OLD.amount_paid        OR
     NEW.deposit_amount     IS DISTINCT FROM OLD.deposit_amount     OR
     NEW.payment_type       IS DISTINCT FROM OLD.payment_type       OR
     NEW.selected_services  IS DISTINCT FROM OLD.selected_services  OR
     NEW.apartment_id       IS DISTINCT FROM OLD.apartment_id       OR
     NEW.user_id            IS DISTINCT FROM OLD.user_id            OR
     NEW.check_in           IS DISTINCT FROM OLD.check_in           OR
     NEW.check_out          IS DISTINCT FROM OLD.check_out          OR
     NEW.booking_code       IS DISTINCT FROM OLD.booking_code       OR
     NEW.balance_payment_url IS DISTINCT FROM OLD.balance_payment_url OR
     NEW.balance_session_id IS DISTINCT FROM OLD.balance_session_id OR
     NEW.balance_link_expires_at IS DISTINCT FROM OLD.balance_link_expires_at OR
     NEW.modification_amount_due IS DISTINCT FROM OLD.modification_amount_due OR
     NEW.modification_payment_url IS DISTINCT FROM OLD.modification_payment_url OR
     NEW.modification_session_id IS DISTINCT FROM OLD.modification_session_id OR
     NEW.modification_link_expires_at IS DISTINCT FROM OLD.modification_link_expires_at THEN
    RAISE EXCEPTION 'Pricing and payment fields cannot be modified';
  END IF;

  -- Confirmed -> cancelled by owner: only status may change
  IF OLD.status = 'confirmed'::booking_status
     AND NEW.status = 'cancelled'::booking_status THEN
    IF NEW.guest_email IS DISTINCT FROM OLD.guest_email OR
       NEW.guest_name IS DISTINCT FROM OLD.guest_name OR
       NEW.guest_last_name IS DISTINCT FROM OLD.guest_last_name OR
       NEW.guest_id_card_number IS DISTINCT FROM OLD.guest_id_card_number OR
       NEW.billing_name IS DISTINCT FROM OLD.billing_name OR
       NEW.billing_address IS DISTINCT FROM OLD.billing_address OR
       NEW.billing_city IS DISTINCT FROM OLD.billing_city OR
       NEW.billing_zip IS DISTINCT FROM OLD.billing_zip OR
       NEW.billing_country IS DISTINCT FROM OLD.billing_country OR
       NEW.billing_fiscal_code IS DISTINCT FROM OLD.billing_fiscal_code THEN
      RAISE EXCEPTION 'Only the booking status may be changed when cancelling a confirmed booking';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

ALTER FUNCTION public.move_to_dlq(text,text,bigint,jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text,integer,integer) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text,jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text,bigint) SET search_path = public, pgmq;

-- Public buckets serve files by URL without a SELECT policy; restrict listing to admins
DROP POLICY IF EXISTS "Anyone can view apartment images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view apartment videos" ON storage.objects;
CREATE POLICY "Admins can list apartment images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'apartment-images' AND public.has_role(auth.uid(), 'admin'::app_role));