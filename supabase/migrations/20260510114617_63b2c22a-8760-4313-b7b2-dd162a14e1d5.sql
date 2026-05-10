
-- 1) Restrict realtime broadcasts to admins only.
-- The current "Authenticated users can receive realtime broadcasts" policy
-- leaks booking PII (guest IDs, payment URLs) to every signed-in user.
DROP POLICY IF EXISTS "Authenticated users can receive realtime broadcasts" ON realtime.messages;
DROP POLICY IF EXISTS "Admins can receive realtime broadcasts" ON realtime.messages;

CREATE POLICY "Admins can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) Revoke EXECUTE from public/anon/authenticated on internal email-queue
-- SECURITY DEFINER helpers. Only the cron job (service_role) should call them.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
