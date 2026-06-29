// Admin-only: updates a booking's editable fields with overlap protection
// and trusted price recomputation. Generates a "modification payment link"
// (24h) when the new total exceeds amount_paid + balance already due.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { computeBookingPrice } from "../_shared/booking-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json(401, { error: "Non autorizzato" });

    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) return json(403, { error: "Accesso riservato agli admin" });

    const body = await req.json();
    const {
      booking_id,
      changes,                      // object with editable fields
      additional_guests,            // optional: full replacement of additional guests
      generate_modification_link,   // boolean
      send_email = false,
    } = body ?? {};

    if (!booking_id) return json(400, { error: "ID prenotazione mancante" });
    if (!changes || typeof changes !== "object") return json(400, { error: "Modifiche mancanti" });

    // ---- fetch current booking ----
    const { data: booking, error: bErr } = await adminClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();
    if (bErr || !booking) return json(404, { error: "Prenotazione non trovata" });

    // ---- whitelist editable fields ----
    const editable = [
      "check_in", "check_out",
      "guest_name", "guest_last_name", "guest_email", "guest_phone",
      "guest_date_of_birth", "guest_place_of_birth", "guest_nationality",
      "guest_id_type", "guest_id_card_number", "guest_id_card_issued", "guest_id_card_expiry",
      "flight_outbound", "flight_return", "arrival_time", "departure_time", "airline", "no_transfer",
      "notes",
      "billing_name", "billing_address", "billing_city", "billing_zip", "billing_country", "billing_fiscal_code",
      "selected_services", // array of {id} or string ids
    ];
    const updateData: Record<string, any> = {};
    for (const k of editable) {
      if (k in changes) updateData[k] = (changes as any)[k];
    }

    const newCheckIn = updateData.check_in ?? booking.check_in;
    const newCheckOut = updateData.check_out ?? booking.check_out;

    // ---- overlap check on date change ----
    if (updateData.check_in || updateData.check_out) {
      const { data: overlaps } = await adminClient
        .from("bookings")
        .select("id, status")
        .eq("apartment_id", booking.apartment_id)
        .neq("id", booking_id)
        .in("status", ["pending", "confirmed", "awaiting_verification", "paid", "modification_pending"])
        .lt("check_in", newCheckOut)
        .gt("check_out", newCheckIn);
      if (overlaps && overlaps.length > 0) {
        return json(409, { error: "Date non disponibili — sovrapposizione con altra prenotazione" });
      }
    }

    // ---- recompute price ----
    const { data: apartment } = await adminClient
      .from("apartments")
      .select("id, name, price_per_night, guests")
      .eq("id", booking.apartment_id)
      .single();
    if (!apartment) return json(404, { error: "Appartamento non trovato" });

    // Resolve service IDs
    const newServicesRaw = updateData.selected_services ?? booking.selected_services ?? [];
    const newServiceIds: string[] = (Array.isArray(newServicesRaw) ? newServicesRaw : [])
      .map((s: any) => (typeof s === "string" ? s : s?.id))
      .filter(Boolean);

    const { data: catalog } = await adminClient
      .from("additional_services")
      .select("id, name, price, is_active");

    const priced = computeBookingPrice({
      apartment: { price_per_night: apartment.price_per_night, guests: apartment.guests },
      check_in: newCheckIn,
      check_out: newCheckOut,
      serviceIds: newServiceIds,
      servicesCatalog: catalog ?? [],
    });

    if (priced.nights < 1) return json(400, { error: "Soggiorno minimo 1 notte" });

    // Replace selected_services with trusted catalog data
    updateData.selected_services = priced.trustedServices;

    const newTotal = priced.totalPrice;
    const oldTotal = Number(booking.total_price ?? 0);
    const diff = Math.round((newTotal - oldTotal) * 100) / 100;
    const amountPaid = Number(booking.amount_paid ?? 0);
    const newBalance = Math.round((newTotal - amountPaid) * 100) / 100;

    updateData.total_price = newTotal;
    updateData.deposit_amount = Math.round(newTotal * 0.2 * 100) / 100;

    // ---- update booking ----
    const { error: updErr } = await adminClient
      .from("bookings")
      .update(updateData)
      .eq("id", booking_id);
    if (updErr) return json(500, { error: `Errore aggiornamento: ${updErr.message}` });

    // ---- additional guests replacement (optional) ----
    if (Array.isArray(additional_guests)) {
      await adminClient.from("booking_guests").delete().eq("booking_id", booking_id);
      if (additional_guests.length > 0) {
        await adminClient.from("booking_guests").insert(
          additional_guests.map((g: any) => ({
            booking_id,
            first_name: g.first_name,
            last_name: g.last_name,
            date_of_birth: g.date_of_birth,
            nationality: g.nationality,
            id_type: g.id_type ?? "id_card",
            id_card_number: g.id_card_number,
            id_card_issued: g.id_card_issued,
            id_card_expiry: g.id_card_expiry,
          }))
        );
      }
    }

    // ---- modification payment link (24h) ----
    let modPaymentUrl: string | null = null;
    let modExpiresAt: number | null = null;
    let modSessionId: string | null = null;
    let modAmount = 0;

    if (generate_modification_link && diff > 0) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) return json(500, { error: "Stripe non configurato" });
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      modAmount = diff;
      modExpiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      const ALLOWED_ORIGINS = ["https://bazhouse.com", "https://www.bazhouse.com", "https://bazhousedemo.vercel.app"];

      const reqOrigin = req.headers.get("origin");

      const origin = reqOrigin && ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[0];

      const customers = await stripe.customers.list({ email: booking.guest_email, limit: 1 });
      const customerId = customers.data[0]?.id;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : booking.guest_email,
        expires_at: modExpiresAt,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: Math.round(modAmount * 100),
            product_data: {
              name: `Modifica prenotazione — ${apartment.name}`,
              description: `Differenza per modifica prenotazione #${booking.booking_code}`,
            },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/prenotazione/${booking_id}?payment=modification_success`,
        cancel_url: `${origin}/prenotazione/${booking_id}`,
        metadata: {
          booking_id,
          booking_code: booking.booking_code,
          payment_type: "modification",
        },
      });

      modPaymentUrl = session.url;
      modSessionId = session.id;

      await adminClient.from("bookings").update({
        modification_amount_due: modAmount,
        modification_payment_url: modPaymentUrl,
        modification_session_id: modSessionId,
        modification_link_expires_at: modExpiresAt,
      } as any).eq("id", booking_id);
    }

    // ---- email customer (non-blocking) ----
    if (send_email) {
      try {
        await adminClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "booking-modified",
            recipientEmail: booking.guest_email,
            idempotencyKey: `booking-modified-${booking_id}-${Date.now()}`,
            templateData: {
              guestName: booking.guest_name,
              apartmentName: apartment.name,
              bookingCode: booking.booking_code,
              checkIn: newCheckIn,
              checkOut: newCheckOut,
              newTotal,
              priceDiff: diff,
              paymentLink: modPaymentUrl,
              paymentLinkExpiresAt: modExpiresAt,
            },
          },
        });
      } catch (e) {
        console.error("[admin-update-booking] email failed:", e);
      }
    }

    return json(200, {
      ok: true,
      new_total: newTotal,
      price_diff: diff,
      new_balance: newBalance,
      modification_payment_url: modPaymentUrl,
      modification_link_expires_at: modExpiresAt,
    });
  } catch (e) {
    console.error("[admin-update-booking] error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Errore sconosciuto" });
  }
});
