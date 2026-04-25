import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

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

// ---------- helpers ----------
const isEmail = (v: unknown) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) && v.length <= 255;
const isNonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const isIsoDate = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());
const isPhone = (v: unknown) => {
  if (typeof v !== "string") return false;
  const digits = v.replace(/\+\d+\s*/, "").replace(/\s/g, "");
  return /^\d{6,15}$/.test(digits);
};
const isDocNumber = (v: unknown, type: string) => {
  if (typeof v !== "string") return false;
  const cleaned = v.replace(/\s/g, "").toUpperCase();
  return type === "passport" ? /^[A-Z0-9]{6,9}$/.test(cleaned) : /^[A-Z0-9]{7,9}$/.test(cleaned);
};
const isZip = (v: unknown) =>
  typeof v === "string" && /^\d{3,10}$/.test(v.replace(/\s/g, ""));
const isFiscal = (v: unknown) =>
  typeof v === "string" && /^[A-Z0-9]{11,16}$/.test(v.replace(/\s/g, "").toUpperCase());

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

    // Verify caller is admin or amministratore
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json(401, { error: "Non autorizzato" });

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);
    const isAdmin = callerRoles?.some((r: any) =>
      r.role === "admin" || r.role === "amministratore"
    );
    if (!isAdmin) return json(403, { error: "Accesso riservato agli amministratori" });

    const body = await req.json();
    const {
      // client target
      client_mode,           // "existing" | "new"
      client_user_id,        // when existing
      new_client,            // { email, first_name, last_name, phone } when new
      // booking core
      apartment_id,
      check_in,
      check_out,
      // main guest
      main_guest,
      additional_guests = [],
      // flight & services
      flight,                // { flight_outbound, flight_return, arrival_time, departure_time, airline }
      no_transfer = false,
      selected_services = [], // array of ids
      notes = "",
      // billing
      billing,               // { billing_name, billing_address, billing_city, billing_zip, billing_country, billing_fiscal_code }
      // payment link generation
      payment_link_type,     // "deposit" | "full" | "none"
      // notifications
      send_email = false,
    } = body ?? {};

    // ---------- VALIDATION ----------
    const errors: string[] = [];

    if (!["existing", "new"].includes(client_mode)) errors.push("client_mode non valido");
    if (client_mode === "existing" && !client_user_id) errors.push("client_user_id richiesto");
    if (client_mode === "new") {
      if (!new_client || !isEmail(new_client.email)) errors.push("Email cliente non valida");
      if (!isNonEmpty(new_client?.first_name)) errors.push("Nome cliente richiesto");
      if (!isNonEmpty(new_client?.last_name)) errors.push("Cognome cliente richiesto");
      if (new_client?.phone && !isPhone(new_client.phone)) errors.push("Telefono cliente non valido");
    }

    if (!isNonEmpty(apartment_id)) errors.push("Appartamento richiesto");
    if (!isIsoDate(check_in) || !isIsoDate(check_out)) errors.push("Date non valide");

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);
    if (nights < 1) errors.push("Soggiorno minimo 1 notte");

    // Main guest
    if (!main_guest) errors.push("Dati ospite principale richiesti");
    else {
      if (!isNonEmpty(main_guest.first_name)) errors.push("Nome ospite richiesto");
      if (!isNonEmpty(main_guest.last_name)) errors.push("Cognome ospite richiesto");
      if (!isIsoDate(main_guest.date_of_birth)) errors.push("Data di nascita ospite non valida");
      if (!isNonEmpty(main_guest.nationality)) errors.push("Nazionalità ospite richiesta");
      if (!isEmail(main_guest.email)) errors.push("Email ospite non valida");
      if (!isPhone(main_guest.phone)) errors.push("Telefono ospite non valido");
      const idType = main_guest.id_type === "passport" ? "passport" : "id_card";
      if (!isDocNumber(main_guest.id_card_number, idType)) errors.push("Documento ospite non valido");
      if (!isIsoDate(main_guest.id_card_issued)) errors.push("Data emissione documento non valida");
      if (!isIsoDate(main_guest.id_card_expiry)) errors.push("Data scadenza documento non valida");
    }

    // Additional guests
    if (Array.isArray(additional_guests)) {
      additional_guests.forEach((g: any, i: number) => {
        if (!isNonEmpty(g.first_name)) errors.push(`Ospite ${i + 2}: nome richiesto`);
        if (!isNonEmpty(g.last_name)) errors.push(`Ospite ${i + 2}: cognome richiesto`);
        if (!isIsoDate(g.date_of_birth)) errors.push(`Ospite ${i + 2}: data nascita non valida`);
        if (!isNonEmpty(g.nationality)) errors.push(`Ospite ${i + 2}: nazionalità richiesta`);
        const idType = g.id_type === "passport" ? "passport" : "id_card";
        if (!isDocNumber(g.id_card_number, idType)) errors.push(`Ospite ${i + 2}: documento non valido`);
        if (!isIsoDate(g.id_card_issued)) errors.push(`Ospite ${i + 2}: data emissione non valida`);
        if (!isIsoDate(g.id_card_expiry)) errors.push(`Ospite ${i + 2}: data scadenza non valida`);
      });
    }

    // Flight (only if transfer enabled)
    if (!no_transfer) {
      if (!flight) errors.push("Dati volo richiesti");
      else {
        if (!isNonEmpty(flight.airline)) errors.push("Compagnia aerea richiesta");
        if (!isNonEmpty(flight.flight_outbound)) errors.push("Volo arrivo richiesto");
        if (!isNonEmpty(flight.arrival_time)) errors.push("Orario arrivo richiesto");
        if (!isNonEmpty(flight.flight_return)) errors.push("Volo partenza richiesto");
        if (!isNonEmpty(flight.departure_time)) errors.push("Orario partenza richiesto");
      }
    }

    // Billing
    if (!billing) errors.push("Dati fatturazione richiesti");
    else {
      if (!isNonEmpty(billing.billing_name)) errors.push("Intestatario fatturazione richiesto");
      if (!isNonEmpty(billing.billing_address)) errors.push("Indirizzo fatturazione richiesto");
      if (!isNonEmpty(billing.billing_city)) errors.push("Città fatturazione richiesta");
      if (!isZip(billing.billing_zip)) errors.push("CAP fatturazione non valido");
      if (!isNonEmpty(billing.billing_country)) errors.push("Paese fatturazione richiesto");
      if (!isFiscal(billing.billing_fiscal_code)) errors.push("Codice Fiscale / P.IVA non valido");
    }

    // Payment link type
    if (!["deposit", "full", "none"].includes(payment_link_type)) {
      errors.push("Tipo link pagamento non valido");
    }

    if (errors.length > 0) return json(400, { error: errors.join(" • ") });

    // ---------- TRUSTED PRICE COMPUTATION ----------
    const { data: apartment, error: aptError } = await adminClient
      .from("apartments")
      .select("id, name, price_per_night, is_active, guests")
      .eq("id", apartment_id)
      .single();
    if (aptError || !apartment) return json(404, { error: "Appartamento non trovato" });

    const totalGuests = 1 + (additional_guests?.length ?? 0);
    if (totalGuests > apartment.guests) {
      return json(400, { error: `Capacità appartamento superata (max ${apartment.guests})` });
    }

    // Overlap check
    const { data: overlaps } = await adminClient
      .from("bookings")
      .select("id, status")
      .eq("apartment_id", apartment_id)
      .in("status", ["pending", "confirmed", "awaiting_verification", "paid"])
      .lt("check_in", check_out)
      .gt("check_out", check_in);
    if (overlaps && overlaps.length > 0) {
      return json(409, { error: "Date non disponibili per questo appartamento" });
    }

    const accommodationTotal = Math.round(Number(apartment.price_per_night) * nights * 100) / 100;

    // Validate services
    let trustedServicesTotal = 0;
    const trustedSelectedServices: Array<{ id: string; name: string; price: number }> = [];
    if (Array.isArray(selected_services) && selected_services.length > 0) {
      const ids = selected_services
        .map((s: any) => (typeof s === "string" ? s : s?.id))
        .filter(Boolean);
      if (ids.length > 0) {
        const { data: dbServices } = await adminClient
          .from("additional_services")
          .select("id, name, price, is_active")
          .in("id", ids);
        for (const id of ids) {
          const svc = dbServices?.find((d: any) => d.id === id);
          if (!svc || !svc.is_active) continue;
          const isPerNight =
            svc.name.toLowerCase().includes("noleggio") ||
            svc.name.toLowerCase().includes("giorno");
          const qty = isPerNight ? nights : 1;
          trustedServicesTotal += Number(svc.price) * qty;
          trustedSelectedServices.push({ id: svc.id, name: svc.name, price: Number(svc.price) });
        }
        trustedServicesTotal = Math.round(trustedServicesTotal * 100) / 100;
      }
    }

    const totalPrice = Math.round((accommodationTotal + trustedServicesTotal) * 100) / 100;
    const depositAmount = Math.round(totalPrice * 0.2 * 100) / 100;

    // Manual booking is always created as pending with 0 paid.
    // Admin generates a Stripe payment link (deposit or full) to send to the client.
    const amountPaid = 0;
    const paymentTypeDb = payment_link_type === "full" ? "full" : "deposit";
    const bookingStatus: "pending" | "confirmed" = "pending";

    // ---------- RESOLVE TARGET USER ----------
    let targetUserId: string;
    let targetEmail: string;

    if (client_mode === "existing") {
      const { data: { user: existing }, error: getErr } =
        await adminClient.auth.admin.getUserById(client_user_id);
      if (getErr || !existing) return json(404, { error: "Cliente non trovato" });
      targetUserId = existing.id;
      targetEmail = existing.email ?? main_guest.email;
    } else {
      // Create user (or reuse if email already exists)
      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email: new_client.email,
        email_confirm: true,
        user_metadata: {
          first_name: new_client.first_name,
          last_name: new_client.last_name,
          phone: new_client.phone ?? "",
        },
      });
      if (createErr || !created?.user) {
        // Email may already exist — surface a clear error
        return json(400, {
          error: createErr?.message?.includes("already")
            ? "Esiste già un account con questa email. Selezionalo dalla ricerca clienti."
            : (createErr?.message ?? "Impossibile creare il cliente"),
        });
      }
      targetUserId = created.user.id;
      targetEmail = created.user.email!;
    }

    // ---------- INSERT BOOKING (service role bypasses RLS) ----------
    const { data: booking, error: insertErr } = await adminClient
      .from("bookings")
      .insert({
        user_id: targetUserId,
        apartment_id,
        check_in,
        check_out,
        guest_name: main_guest.first_name,
        guest_last_name: main_guest.last_name,
        guest_email: main_guest.email,
        guest_phone: main_guest.phone,
        guest_date_of_birth: main_guest.date_of_birth,
        guest_place_of_birth: main_guest.place_of_birth ?? null,
        guest_nationality: main_guest.nationality,
        guest_id_type: main_guest.id_type ?? "id_card",
        guest_id_card_number: main_guest.id_card_number,
        guest_id_card_issued: main_guest.id_card_issued,
        guest_id_card_expiry: main_guest.id_card_expiry,
        flight_outbound: no_transfer ? null : flight.flight_outbound,
        flight_return: no_transfer ? null : flight.flight_return,
        arrival_time: no_transfer ? null : flight.arrival_time,
        departure_time: no_transfer ? null : flight.departure_time,
        airline: no_transfer ? null : flight.airline,
        no_transfer: !!no_transfer,
        billing_name: billing.billing_name,
        billing_address: billing.billing_address,
        billing_city: billing.billing_city,
        billing_zip: billing.billing_zip,
        billing_country: billing.billing_country,
        billing_fiscal_code: billing.billing_fiscal_code,
        selected_services: trustedSelectedServices,
        notes,
        status: bookingStatus,
        total_price: totalPrice,
        deposit_amount: depositAmount,
        amount_paid: amountPaid,
        payment_type: paymentTypeDb,
      })
      .select()
      .single();

    if (insertErr || !booking) {
      console.error("[admin-create-booking] insert error:", insertErr);
      return json(500, { error: `Errore creazione prenotazione: ${insertErr?.message}` });
    }

    // Insert additional guests
    if (Array.isArray(additional_guests) && additional_guests.length > 0) {
      const { error: guestErr } = await adminClient.from("booking_guests").insert(
        additional_guests.map((g: any) => ({
          booking_id: booking.id,
          first_name: g.first_name,
          last_name: g.last_name,
          date_of_birth: g.date_of_birth,
          nationality: g.nationality,
          id_type: g.id_type ?? "id_card",
          id_card_number: g.id_card_number,
          id_card_issued: g.id_card_issued,
          id_card_expiry: g.id_card_expiry,
        })),
      );
      if (guestErr) console.error("[admin-create-booking] guests insert error:", guestErr);
    }

    // ---------- STRIPE PAYMENT LINK (deposit or full) ----------
    let paymentLinkUrl: string | null = null;
    let paymentLinkExpiresAt: number | null = null;
    let paymentLinkSessionId: string | null = null;
    let paymentLinkAmount = 0;

    if (payment_link_type === "deposit" || payment_link_type === "full") {
      try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) throw new Error("Stripe non configurato");
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        paymentLinkAmount = payment_link_type === "full" ? totalPrice : depositAmount;
        const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        const origin = req.headers.get("origin") || "https://bazhousedemo.vercel.app";

        const customers = await stripe.customers.list({ email: targetEmail, limit: 1 });
        const customerId = customers.data[0]?.id;

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_email: customerId ? undefined : targetEmail,
          expires_at: expiresAt,
          line_items: [{
            price_data: {
              currency: "eur",
              unit_amount: Math.round(paymentLinkAmount * 100),
              product_data: {
                name: payment_link_type === "full"
                  ? `Pagamento totale — ${apartment.name}`
                  : `Caparra (20%) — ${apartment.name}`,
                description: `Prenotazione #${booking.booking_code}`,
              },
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: `${origin}/prenotazione/${booking.id}?payment=${payment_link_type === "full" ? "full_success" : "deposit_success"}`,
          cancel_url: `${origin}/prenotazione/${booking.id}`,
          metadata: {
            booking_id: booking.id,
            booking_code: booking.booking_code,
            payment_type: payment_link_type === "full" ? "full" : "deposit",
            source: "admin_manual",
          },
        });

        paymentLinkUrl = session.url;
        paymentLinkExpiresAt = expiresAt;
        paymentLinkSessionId = session.id;

        await adminClient.from("bookings").update({
          balance_payment_url: paymentLinkUrl,
          balance_session_id: paymentLinkSessionId,
          balance_link_expires_at: paymentLinkExpiresAt,
        }).eq("id", booking.id);
      } catch (stripeErr) {
        console.error("[admin-create-booking] stripe link error:", stripeErr);
        // Booking exists — surface the failure so admin can retry from detail page
        return json(200, {
          success: true,
          booking_id: booking.id,
          booking_code: booking.booking_code,
          user_id: targetUserId,
          payment_link_error: stripeErr instanceof Error ? stripeErr.message : "Errore generazione link",
        });
      }
    }

    // ---------- OPTIONAL EMAIL ----------
    if (send_email) {
      try {
        const isPaymentRequest = !!paymentLinkUrl;
        await adminClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: isPaymentRequest ? "balance-payment-request" : "booking-confirmation",
            recipientEmail: targetEmail,
            idempotencyKey: `admin-booking-${isPaymentRequest ? "paylink" : "confirm"}-${booking.id}`,
            templateData: isPaymentRequest
              ? {
                  guestName: main_guest.first_name,
                  apartmentName: apartment.name,
                  bookingCode: booking.booking_code,
                  totalPrice,
                  amountPaid: 0,
                  checkIn: check_in,
                  checkOut: check_out,
                  paymentLink: paymentLinkUrl,
                }
              : {
                  guestName: main_guest.first_name,
                  bookingCode: booking.booking_code,
                  apartmentName: apartment.name,
                  checkIn: check_in,
                  checkOut: check_out,
                  nights,
                  totalPrice,
                  amountPaid,
                  balanceDue: totalPrice,
                },
          },
        });
      } catch (mailErr) {
        console.error("[admin-create-booking] email send failed:", mailErr);
      }
    }

    return json(200, {
      success: true,
      booking_id: booking.id,
      booking_code: booking.booking_code,
      user_id: targetUserId,
      payment_link_url: paymentLinkUrl,
      payment_link_amount: paymentLinkAmount,
      payment_link_expires_at: paymentLinkExpiresAt,
    });
  } catch (err) {
    console.error("[admin-create-booking] error:", err);
    return json(500, {
      error: err instanceof Error ? err.message : "Errore interno",
    });
  }
});
