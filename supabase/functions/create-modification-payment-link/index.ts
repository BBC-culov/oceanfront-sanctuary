// Admin: (re)generate a 24h Stripe Checkout link for a booking's modification balance.
// Used when the previous link expired or was never created.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Non autorizzato" });

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) return json(401, { error: "Non autorizzato" });

    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json(403, { error: "Accesso riservato agli admin" });

    const { booking_id, amount, action, send_email_to_guest, payment_link, expire_session_id } = await req.json();
    if (!booking_id) return json(400, { error: "ID prenotazione mancante" });

    const { data: booking } = await adminClient
      .from("bookings").select("*").eq("id", booking_id).single();
    if (!booking) return json(404, { error: "Prenotazione non trovata" });

    const { data: apt } = await adminClient
      .from("apartments").select("name").eq("id", booking.apartment_id).single();

    if (action === "send_email") {
      if (!payment_link) return json(400, { error: "Link mancante" });
      try {
        await adminClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "modification-payment-request",
            recipientEmail: booking.guest_email,
            idempotencyKey: `mod-pay-req-${booking_id}-${Date.now()}`,
            templateData: {
              guestName: booking.guest_name,
              apartmentName: apt?.name ?? "Appartamento",
              bookingCode: booking.booking_code,
              amount: (booking as any).modification_amount_due ?? 0,
              paymentLink: payment_link,
            },
          },
        });
      } catch (e) {
        return json(500, { error: e instanceof Error ? e.message : "Email fallita" });
      }
      return json(200, { ok: true });
    }

    const amt = Number(amount ?? (booking as any).modification_amount_due ?? 0);
    if (!amt || amt <= 0) return json(400, { error: "Importo non valido" });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json(500, { error: "Stripe non configurato" });
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    if (expire_session_id) {
      try { await stripe.checkout.sessions.expire(expire_session_id); } catch (_) { /* ignore */ }
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const origin = req.headers.get("origin") || "https://bazhousedemo.vercel.app";

    const customers = await stripe.customers.list({ email: booking.guest_email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : booking.guest_email,
      expires_at: expiresAt,
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amt * 100),
          product_data: {
            name: `Modifica prenotazione — ${apt?.name ?? "Appartamento"}`,
            description: `Differenza per modifica prenotazione #${booking.booking_code}`,
          },
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/prenotazione/${booking_id}?payment=modification_success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/prenotazione/${booking_id}`,
      metadata: { booking_id, booking_code: booking.booking_code, payment_type: "modification" },
    });

    await adminClient.from("bookings").update({
      modification_amount_due: amt,
      modification_payment_url: session.url,
      modification_session_id: session.id,
      modification_link_expires_at: expiresAt,
    } as any).eq("id", booking_id);

    if (send_email_to_guest) {
      try {
        await adminClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "modification-payment-request",
            recipientEmail: booking.guest_email,
            idempotencyKey: `mod-pay-req-${booking_id}-${Date.now()}`,
            templateData: {
              guestName: booking.guest_name,
              apartmentName: apt?.name ?? "Appartamento",
              bookingCode: booking.booking_code,
              amount: amt,
              paymentLink: session.url,
            },
          },
        });
      } catch (e) { console.error("[mod-pay-link] email failed:", e); }
    }

    return json(200, { url: session.url, expires_at: expiresAt, session_id: session.id });
  } catch (e) {
    console.error("[create-modification-payment-link] error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Errore sconosciuto" });
  }
});
