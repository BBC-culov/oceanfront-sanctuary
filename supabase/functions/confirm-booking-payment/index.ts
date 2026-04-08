import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("Utente non autenticato");

    const { booking_id, type } = await req.json();
    if (!booking_id) throw new Error("ID prenotazione mancante");

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user owns this booking
    const { data: booking, error: bErr } = await serviceClient
      .from("bookings")
      .select("*, apartments(name)")
      .eq("id", booking_id)
      .eq("user_id", user.id)
      .single();

    if (bErr || !booking) throw new Error("Prenotazione non trovata");

    const apartmentName = (booking as any).apartments?.name || "Appartamento";

    if (type === "initial") {
      if (booking.status !== "pending") {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const amountPaid = booking.payment_type === "deposit" ? booking.deposit_amount : booking.total_price;

      const { error: updateErr } = await serviceClient
        .from("bookings")
        .update({ status: "confirmed", amount_paid: amountPaid })
        .eq("id", booking_id);

      if (updateErr) throw new Error(`Errore aggiornamento: ${updateErr.message}`);

      // Send booking confirmation email
      try {
        await serviceClient.functions.invoke("send-email", {
          body: {
            type: "booking_confirmation",
            data: {
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              apartmentName,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
              amountPaid: amountPaid || 0,
              paymentType: booking.payment_type,
            },
          },
        });
      } catch (emailErr) {
        console.error("Email send failed (non-blocking):", emailErr);
      }

    } else if (type === "balance") {
      if (booking.status !== "confirmed") throw new Error("Prenotazione non confermata");

      const { error: updateErr } = await serviceClient
        .from("bookings")
        .update({ amount_paid: booking.total_price, payment_type: "full" })
        .eq("id", booking_id);

      if (updateErr) throw new Error(`Errore aggiornamento: ${updateErr.message}`);

      // Send balance paid email
      try {
        await serviceClient.functions.invoke("send-email", {
          body: {
            type: "balance_paid",
            data: {
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              apartmentName,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
              amountPaid: booking.total_price || 0,
              paymentType: "full",
              checkIn: booking.check_in,
              checkOut: booking.check_out,
            },
          },
        });
      } catch (emailErr) {
        console.error("Email send failed (non-blocking):", emailErr);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in confirm-booking-payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
