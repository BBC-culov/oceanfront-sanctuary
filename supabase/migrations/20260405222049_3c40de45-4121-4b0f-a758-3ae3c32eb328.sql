DROP POLICY IF EXISTS "Users can update own pending bookings" ON public.bookings;
CREATE POLICY "Users can update own pending bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending'::booking_status)
  WITH CHECK (auth.uid() = user_id AND status = 'pending'::booking_status);