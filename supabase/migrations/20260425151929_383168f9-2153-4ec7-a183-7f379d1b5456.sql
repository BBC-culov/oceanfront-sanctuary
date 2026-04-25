-- 1) Revoke client read access to resume_token on bookings.
-- The token is only consumed server-side via get_booking_by_resume_token RPC.
REVOKE SELECT (resume_token) ON public.bookings FROM authenticated, anon;

-- 2) Restrict Realtime channel subscriptions to authenticated users.
-- Without any policy on realtime.messages, all channels are open. This adds a
-- baseline policy requiring authentication to subscribe to any channel.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive realtime broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
