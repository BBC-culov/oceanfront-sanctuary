import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

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

    const { booking_id, type, session_id } = await req.json();
    if (!booking_id) throw new Error("ID prenotazione mancante");
    if (!session_id || typeof session_id !== "string") {
      throw new Error("Sessione di pagamento mancante");
    }

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

    // SERVER-SIDE STRIPE VERIFICATION — single source of truth.
    // Without this, an authenticated user could call this endpoint directly
    // and mark the booking as paid without ever paying.
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    let stripeSession: Stripe.Checkout.Session;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    } catch (e) {
      throw new Error("Sessione Stripe non valida");
    }
    if (stripeSession.payment_status !== "paid") {
      throw new Error("Pagamento non completato");
    }
    if (stripeSession.metadata?.booking_id !== booking_id) {
      throw new Error("Sessione non associata a questa prenotazione");
    }
    // Also verify session payment_type matches the requested type when set
    const sessionPaymentType = stripeSession.metadata?.payment_type;
    const expectedTypes: Record<string, string[]> = {
      initial: ["deposit", "full"],
      full: ["full", "deposit"],
      balance: ["balance"],
      modification: ["modification"],
    };
    if (sessionPaymentType && expectedTypes[type] && !expectedTypes[type].includes(sessionPaymentType)) {
      throw new Error("Tipo di pagamento non corrispondente");
    }

    const apartmentName = (booking as any).apartments?.name || "Appartamento";

    if (type === "initial" || type === "full") {
      // Allow promotion from both legacy "pending" and new "incomplete" (Fase 4)
      if (booking.status !== "pending" && booking.status !== "incomplete") {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // "full" forces full payment regardless of stored payment_type (admin link case).
      // "initial" respects the stored payment_type (deposit vs full).
      const isFull = type === "full" || booking.payment_type === "full";
      const amountPaid = isFull ? booking.total_price : booking.deposit_amount;
      const newPaymentType = isFull ? "full" : booking.payment_type;

      // NEW FLOW: payment received but admin must manually verify and confirm.
      // If the customer paid the full amount in one shot we mark the booking as
      // "paid" already (still awaiting admin confirmation visually via flag in UI),
      // otherwise we use "awaiting_verification" until manual review.
      const newStatus = "awaiting_verification";

      const { error: updateErr } = await serviceClient
        .from("bookings")
        .update({
          status: newStatus,
          amount_paid: amountPaid,
          payment_type: newPaymentType,
          // Invalidate the deposit/full payment link — admin must generate
          // a fresh balance link if a balance is still due.
          balance_payment_url: null,
          balance_session_id: null,
          balance_link_expires_at: null,
          // Invalidate recovery token: booking is no longer "incomplete"
          resume_token: null,
        })
        .eq("id", booking_id);

      if (updateErr) throw new Error(`Errore aggiornamento: ${updateErr.message}`);

      // Send booking confirmation email (guest)
      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "booking-confirmation",
            recipientEmail: booking.guest_email,
            idempotencyKey: `booking-confirm-${booking_id}`,
            templateData: {
              guestName: booking.guest_name,
              apartmentName,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
              amountPaid: amountPaid || 0,
              paymentType: newPaymentType,
            },
          },
        });
      } catch (emailErr) {
        console.error("Email send failed (non-blocking):", emailErr);
      }

      // Send admin notification
      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: "info@bazhouse.com",
            idempotencyKey: `admin-booking-${booking_id}`,
            templateData: {
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              apartmentName,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
              amountPaid: amountPaid || 0,
              paymentType: newPaymentType,
              notificationType: "initial",
            },
          },
        });
      } catch (emailErr) {
        console.error("Admin email send failed (non-blocking):", emailErr);
      }

    } else if (type === "modification") {
      // Modification payment received: clear modification_amount_due,
      // record amount toward amount_paid, clear modification link state.
      const modAmount = Number((booking as any).modification_amount_due ?? 0);
      const newAmountPaid = Math.round((Number(booking.amount_paid ?? 0) + modAmount) * 100) / 100;

      const { error: updErr } = await serviceClient
        .from("bookings")
        .update({
          amount_paid: newAmountPaid,
          modification_amount_due: 0,
          modification_payment_url: null,
          modification_session_id: null,
          modification_link_expires_at: null,
        } as any)
        .eq("id", booking_id);

      if (updErr) throw new Error(`Errore aggiornamento: ${updErr.message}`);

      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: "info@bazhouse.com",
            idempotencyKey: `admin-mod-paid-${booking_id}-${Date.now()}`,
            templateData: {
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              apartmentName,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
              amountPaid: newAmountPaid,
              paymentType: "modification",
              notificationType: "balance",
            },
          },
        });
      } catch (e) { console.error("Admin mod-paid email failed:", e); }

    } else if (type === "balance") {
      if (booking.status !== "confirmed") throw new Error("Prenotazione non confermata");

      const { error: updateErr } = await serviceClient
        .from("bookings")
        .update({ amount_paid: booking.total_price, payment_type: "full" })
        .eq("id", booking_id);

      if (updateErr) throw new Error(`Errore aggiornamento: ${updateErr.message}`);

      // Send balance paid email (guest)
      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "balance-paid",
            recipientEmail: booking.guest_email,
            idempotencyKey: `balance-paid-${booking_id}`,
            templateData: {
              guestName: booking.guest_name,
              apartmentName,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
            },
          },
        });
      } catch (emailErr) {
        console.error("Email send failed (non-blocking):", emailErr);
      }

      // Send admin notification for balance
      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-notification",
            recipientEmail: "info@bazhouse.com",
            idempotencyKey: `admin-balance-${booking_id}`,
            templateData: {
              guestName: booking.guest_name,
              guestEmail: booking.guest_email,
              apartmentName,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              bookingCode: booking.booking_code,
              totalPrice: booking.total_price || 0,
              amountPaid: booking.total_price || 0,
              paymentType: "full",
              notificationType: "balance",
            },
          },
        });
      } catch (emailErr) {
        console.error("Admin email send failed (non-blocking):", emailErr);
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
