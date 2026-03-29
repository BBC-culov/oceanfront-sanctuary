CREATE POLICY "Users can delete own pending bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete own booking guests"
ON public.booking_guests
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM bookings b
  WHERE b.id = booking_guests.booking_id AND b.user_id = auth.uid()
));

CREATE POLICY "Users can update own pending bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);