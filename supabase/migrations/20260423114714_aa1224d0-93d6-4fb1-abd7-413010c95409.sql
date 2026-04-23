-- Replace the overly broad "cancel own confirmed bookings" UPDATE policy
-- with one that prevents users from modifying financial or other sensitive
-- fields while changing status from 'confirmed' to 'cancelled'.

DROP POLICY IF EXISTS "Users can cancel own confirmed bookings" ON public.bookings;

CREATE POLICY "Users can cancel own confirmed bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND status = 'confirmed'::booking_status
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'cancelled'::booking_status
);

-- Trigger: when a user (non-admin) cancels a confirmed booking, ensure
-- no sensitive financial / identity / billing fields are modified.
CREATE OR REPLACE FUNCTION public.prevent_user_booking_field_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins bypass this check
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Only enforce on the confirmed -> cancelled transition by the owner
  IF OLD.status = 'confirmed'::booking_status
     AND NEW.status = 'cancelled'::booking_status
     AND auth.uid() = OLD.user_id THEN

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
       NEW.guest_email        IS DISTINCT FROM OLD.guest_email        OR
       NEW.guest_name         IS DISTINCT FROM OLD.guest_name         OR
       NEW.guest_last_name    IS DISTINCT FROM OLD.guest_last_name    OR
       NEW.guest_id_card_number IS DISTINCT FROM OLD.guest_id_card_number OR
       NEW.billing_name       IS DISTINCT FROM OLD.billing_name       OR
       NEW.billing_address    IS DISTINCT FROM OLD.billing_address    OR
       NEW.billing_city       IS DISTINCT FROM OLD.billing_city       OR
       NEW.billing_zip        IS DISTINCT FROM OLD.billing_zip        OR
       NEW.billing_country    IS DISTINCT FROM OLD.billing_country    OR
       NEW.billing_fiscal_code IS DISTINCT FROM OLD.billing_fiscal_code THEN
      RAISE EXCEPTION 'Only the booking status may be changed when cancelling a confirmed booking';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_user_booking_field_tampering_trg ON public.bookings;

CREATE TRIGGER prevent_user_booking_field_tampering_trg
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_booking_field_tampering();