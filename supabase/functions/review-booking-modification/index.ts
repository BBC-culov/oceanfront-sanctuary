// Admin: approve or reject a modification request.
// On approve: applies requested_changes to booking, restores original status,
// optionally generates a modification payment link (24h) for the price diff.

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

    const { request_id, action, admin_note, rejection_reason, generate_modification_link, restore_status = "confirmed" } =
      await req.json();
    if (!request_id || !["approve", "reject"].includes(action)) {
      return json(400, { error: "Parametri non validi" });
    }

    const { data: request } = await adminClient
      .from("booking_modification_requests").select("*").eq("id", request_id).single();
    if (!request) return json(404, { error: "Richiesta non trovata" });
    if (request.status !== "pending") return json(400, { error: "Richiesta già gestita" });

    const { data: booking } = await adminClient
      .from("bookings").select("*").eq("id", request.booking_id).single();
    if (!booking) return json(404, { error: "Prenotazione non trovata" });

    const { data: apt } = await adminClient
      .from("apartments").select("name").eq("id", booking.apartment_id).single();

    if (action === "reject") {
      await adminClient.from("booking_modification_requests").update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_note: admin_note ?? null,
        rejection_reason: rejection_reason ?? null,
      }).eq("id", request_id);

      // Restore booking status (assume confirmed if restore_status not specified)
      await adminClient.from("bookings").update({ status: restore_status } as any).eq("id", booking.id);

      try {
        await adminClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "modification-rejected",
            recipientEmail: booking.guest_email,
            idempotencyKey: `mod-rej-${request_id}`,
            templateData: {
              guestName: booking.guest_name,
              bookingCode: booking.booking_code,
              rejectionReason: rejection_reason ?? "",
              adminNote: admin_note ?? "",
            },
          },
        });
      } catch (e) { console.error("[review-mod] reject email failed:", e); }

      return json(200, { ok: true });
    }

    // ---- APPROVE: apply changes ----
    const changes = request.requested_changes ?? {};
    const updateData: Record<string, any> = {};
    const editable = [
      "check_in", "check_out",
      "guest_name", "guest_last_name", "guest_phone",
      "guest_date_of_birth", "guest_place_of_birth", "guest_nationality",
      "guest_id_type", "guest_id_card_number", "guest_id_card_issued", "guest_id_card_expiry",
      "flight_outbound", "flight_return", "arrival_time", "departure_time", "airline", "no_transfer",
      "notes", "selected_services",
    ];
    for (const k of editable) if (k in changes) updateData[k] = changes[k];

    // Apply additional guests replacement if requested
    if (Array.isArray((changes as any).additional_guests)) {
      const guests = (changes as any).additional_guests;
      await adminClient.from("booking_guests").delete().eq("booking_id", booking.id);
      if (guests.length > 0) {
        await adminClient.from("booking_guests").insert(
          guests.map((g: any) => ({
            booking_id: booking.id,
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

    updateData.total_price = request.new_total;
    updateData.deposit_amount = Math.round(Number(request.new_total) * 0.2 * 100) / 100;
    updateData.status = restore_status;

    // Optional payment link (24h) when there's a positive diff
    let modPaymentUrl: string | null = null;
    let modExpiresAt: number | null = null;
    let modSessionId: string | null = null;
    const diff = Number(request.price_diff ?? 0);

    if (generate_modification_link && diff > 0) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) return json(500, { error: "Stripe non configurato" });
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      modExpiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      const origin = req.headers.get("origin") || "https://bazhousedemo.vercel.app";

      const customers = await stripe.customers.list({ email: booking.guest_email, limit: 1 });
      const customerId = customers.data[0]?.id;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : booking.guest_email,
        expires_at: modExpiresAt,
        line_items: [{
          price_data: {
            currency: "eur",
            unit_amount: Math.round(diff * 100),
            product_data: {
              name: `Modifica prenotazione — ${apt?.name ?? "Appartamento"}`,
              description: `Differenza per modifica prenotazione #${booking.booking_code}`,
            },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/prenotazione/${booking.id}?payment=modification_success`,
        cancel_url: `${origin}/prenotazione/${booking.id}`,
        metadata: {
          booking_id: booking.id,
          booking_code: booking.booking_code,
          payment_type: "modification",
          modification_request_id: request_id,
        },
      });

      modPaymentUrl = session.url;
      modSessionId = session.id;

      updateData.modification_amount_due = diff;
      updateData.modification_payment_url = modPaymentUrl;
      updateData.modification_session_id = modSessionId;
      updateData.modification_link_expires_at = modExpiresAt;
    }

    await adminClient.from("bookings").update(updateData).eq("id", booking.id);

    await adminClient.from("booking_modification_requests").update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_note: admin_note ?? null,
    }).eq("id", request_id);

    try {
      await adminClient.functions.invoke("send-transactional-email", {
        body: {
          templateName: "modification-approved",
          recipientEmail: booking.guest_email,
          idempotencyKey: `mod-app-${request_id}`,
          templateData: {
            guestName: booking.guest_name,
            bookingCode: booking.booking_code,
            newTotal: request.new_total,
            priceDiff: diff,
            paymentLink: modPaymentUrl,
            adminNote: admin_note ?? "",
          },
        },
      });
    } catch (e) { console.error("[review-mod] approve email failed:", e); }

    return json(200, {
      ok: true,
      modification_payment_url: modPaymentUrl,
      modification_link_expires_at: modExpiresAt,
    });
  } catch (e) {
    console.error("[review-booking-modification] error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Errore sconosciuto" });
  }
});
