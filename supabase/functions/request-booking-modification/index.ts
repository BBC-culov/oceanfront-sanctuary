// Customer-facing: creates a modification request on a booking.
// Validates ownership, blocks if a pending request already exists,
// recomputes the proposed total, sets booking status to modification_pending.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { computeBookingPrice, diffChanges } from "../_shared/booking-pricing.ts";

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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json(401, { error: "Non autenticato" });

    const { booking_id, changes, additional_guests, customer_note } = await req.json();
    if (!booking_id || !changes) return json(400, { error: "Dati richiesti mancanti" });

    // Fetch booking and verify ownership
    const { data: booking } = await adminClient
      .from("bookings").select("*").eq("id", booking_id).eq("user_id", user.id).single();
    if (!booking) return json(404, { error: "Prenotazione non trovata" });

    if (!["confirmed", "awaiting_verification", "paid"].includes(booking.status)) {
      return json(400, { error: "Non è possibile richiedere modifiche su questa prenotazione" });
    }

    // Block if a pending request already exists
    const { data: existing } = await adminClient
      .from("booking_modification_requests")
      .select("id").eq("booking_id", booking_id).eq("status", "pending").maybeSingle();
    if (existing) {
      return json(409, { error: "Hai già una richiesta di modifica in attesa per questa prenotazione" });
    }

    // Whitelist customer-editable fields
    const allowed = [
      "check_in", "check_out",
      "guest_name", "guest_last_name", "guest_phone",
      "guest_date_of_birth", "guest_place_of_birth", "guest_nationality",
      "guest_id_type", "guest_id_card_number", "guest_id_card_issued", "guest_id_card_expiry",
      "flight_outbound", "flight_return", "arrival_time", "departure_time", "airline", "no_transfer",
      "notes",
      "selected_services",
    ];
    const proposed: Record<string, any> = {};
    for (const k of allowed) if (k in changes) proposed[k] = changes[k];

    // Build "current" snapshot of the same fields
    const current: Record<string, any> = {};
    for (const k of allowed) current[k] = (booking as any)[k];

    // Additional guests: include in snapshot if provided
    if (Array.isArray(additional_guests)) {
      const { data: currentGuests } = await adminClient
        .from("booking_guests").select("first_name,last_name,date_of_birth,nationality,id_type,id_card_number,id_card_issued,id_card_expiry")
        .eq("booking_id", booking_id);
      current.additional_guests = currentGuests ?? [];
      proposed.additional_guests = additional_guests;
    }

    const realChanges = diffChanges(current, proposed);
    if (Object.keys(realChanges).length === 0) {
      return json(400, { error: "Nessuna modifica rilevata" });
    }

    // Compute proposed total
    const newCheckIn = proposed.check_in ?? booking.check_in;
    const newCheckOut = proposed.check_out ?? booking.check_out;

    // Date overlap check (excluding self)
    if (proposed.check_in || proposed.check_out) {
      const { data: overlaps } = await adminClient
        .from("bookings").select("id")
        .eq("apartment_id", booking.apartment_id)
        .neq("id", booking_id)
        .in("status", ["pending", "confirmed", "awaiting_verification", "paid", "modification_pending"])
        .lt("check_in", newCheckOut)
        .gt("check_out", newCheckIn);
      if (overlaps && overlaps.length > 0) {
        return json(409, { error: "Le nuove date non sono disponibili" });
      }
    }

    const { data: apt } = await adminClient
      .from("apartments").select("id, price_per_night, guests").eq("id", booking.apartment_id).single();
    if (!apt) return json(404, { error: "Appartamento non trovato" });

    const newServicesRaw = proposed.selected_services ?? booking.selected_services ?? [];
    const newServiceIds: string[] = (Array.isArray(newServicesRaw) ? newServicesRaw : [])
      .map((s: any) => (typeof s === "string" ? s : s?.id)).filter(Boolean);

    const { data: catalog } = await adminClient
      .from("additional_services").select("id, name, price, is_active");

    const priced = computeBookingPrice({
      apartment: { price_per_night: apt.price_per_night, guests: apt.guests },
      check_in: newCheckIn, check_out: newCheckOut,
      serviceIds: newServiceIds,
      servicesCatalog: catalog ?? [],
    });

    if (priced.nights < 1) return json(400, { error: "Soggiorno minimo 1 notte" });

    // Save trusted services in proposed for review
    proposed.selected_services = priced.trustedServices;

    const currentTotal = Number(booking.total_price ?? 0);
    const newTotal = priced.totalPrice;
    const priceDiff = Math.round((newTotal - currentTotal) * 100) / 100;

    const { data: created, error: cErr } = await adminClient
      .from("booking_modification_requests").insert({
        booking_id,
        requested_by: user.id,
        status: "pending",
        current_data: current,
        requested_changes: proposed,
        current_total: currentTotal,
        new_total: newTotal,
        price_diff: priceDiff,
        customer_note: customer_note ?? null,
      }).select().single();
    if (cErr) return json(500, { error: `Errore creazione richiesta: ${cErr.message}` });

    // Mark booking as modification_pending (preserves original status indirectly via request snapshot)
    await adminClient.from("bookings").update({ status: "modification_pending" } as any).eq("id", booking_id);

    // Email: customer confirmation + admin notification
    try {
      await adminClient.functions.invoke("send-transactional-email", {
        body: {
          templateName: "modification-request-received",
          recipientEmail: booking.guest_email,
          idempotencyKey: `mod-req-recv-${created.id}`,
          templateData: {
            guestName: booking.guest_name,
            bookingCode: booking.booking_code,
            priceDiff,
            newTotal,
          },
        },
      });
    } catch (e) { console.error("[req-mod] customer email failed:", e); }

    try {
      await adminClient.functions.invoke("send-transactional-email", {
        body: {
          templateName: "modification-request-admin",
          recipientEmail: "info@bazhouse.it",
          idempotencyKey: `mod-req-admin-${created.id}`,
          templateData: {
            guestName: booking.guest_name,
            guestEmail: booking.guest_email,
            bookingCode: booking.booking_code,
            priceDiff,
            newTotal,
            requestId: created.id,
          },
        },
      });
    } catch (e) { console.error("[req-mod] admin email failed:", e); }

    return json(200, { ok: true, request_id: created.id, price_diff: priceDiff, new_total: newTotal });
  } catch (e) {
    console.error("[request-booking-modification] error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Errore sconosciuto" });
  }
});
