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

    // Calculate date range: 7-10 days from now
    const now = new Date();
    const in7days = new Date(now);
    in7days.setDate(in7days.getDate() + 7);
    const in10days = new Date(now);
    in10days.setDate(in10days.getDate() + 10);

    const dateFrom = in7days.toISOString().split("T")[0];
    const dateTo = in10days.toISOString().split("T")[0];

    // Find confirmed deposit bookings with check-in between 7-10 days from now
    const { data: bookings, error } = await serviceClient
      .from("bookings")
      .select("*, apartments(name)")
      .in("status", ["confirmed", "awaiting_verification"])
      .eq("payment_type", "deposit")
      .gte("check_in", dateFrom)
      .lte("check_in", dateTo);

    if (error) throw new Error(`Query error: ${error.message}`);

    const reminders: string[] = [];

    for (const booking of bookings || []) {
      // Only send if there's still a balance
      if (booking.amount_paid >= (booking.total_price || 0)) continue;

      const checkInDate = new Date(booking.check_in);
      const daysLeft = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "balance-reminder",
            recipientEmail: booking.guest_email,
            idempotencyKey: `balance-reminder-${booking.id}-${daysLeft}`,
            templateData: {
              guestName: booking.guest_name,
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