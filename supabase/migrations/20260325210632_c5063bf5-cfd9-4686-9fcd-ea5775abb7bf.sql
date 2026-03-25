
-- Add a RESTRICTIVE policy that blocks ALL client-side inserts into user_roles.
-- Legitimate inserts happen via:
-- 1. handle_new_user_role trigger (SECURITY DEFINER, bypasses RLS)
-- 2. manage-admin edge function (service_role key, bypasses RLS)
-- This prevents any authenticated user from inserting roles via the client SDK.
CREATE POLICY "Block all client inserts"
ON public.user_roles AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (false);
