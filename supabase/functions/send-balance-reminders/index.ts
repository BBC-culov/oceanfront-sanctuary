import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find confirmed bookings with deposit payment where check-in is exactly 10 days from now
    // and amount_paid < total_price
    const { data: bookings, error } = await serviceClient
      .from("bookings")
      .select("*, apartments(name)")
      .eq("status", "confirmed")
      .eq("payment_type", "deposit")
      .lt("amount_paid", serviceClient.rpc ? undefined : 999999999);

    if (error) throw new Error(`Query error: ${error.message}`);

    const now = new Date();
    const reminders: string[] = [];

    for (const booking of bookings || []) {
      // Check if amount_paid < total_price
      if (booking.amount_paid >= (booking.total_price || 0)) continue;

      const checkInDate = new Date(booking.check_in);
      const diffMs = checkInDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Send reminder at 10 days before check-in
      if (daysLeft <= 10 && daysLeft >= 7) {
        try {
          await serviceClient.functions.invoke("send-email", {
            body: {
              type: "balance_reminder",
              data: {
                guestName: booking.guest_name,
                guestEmail: booking.guest_email,
                apartmentName: (booking as any).apartments?.name || "Appartamento",
                bookingCode: booking.booking_code,
                totalPrice: booking.total_price || 0,
                amountPaid: booking.amount_paid || 0,
                checkIn: booking.check_in,
                daysLeft,
              },
            },
          });
          reminders.push(booking.booking_code);
        } catch (emailErr) {
          console.error(`Failed to send reminder for ${booking.booking_code}:`, emailErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, reminders_sent: reminders.length, codes: reminders }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-balance-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});