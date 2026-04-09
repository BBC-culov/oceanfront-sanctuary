
CREATE POLICY "Users can cancel own confirmed bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'confirmed')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
