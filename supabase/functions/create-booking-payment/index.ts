import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

  // Service-role client for trusted reads (apartments, services, overlap check)
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user?.email) throw new Error("Utente non autenticato");

    const body = await req.json();
    const {
      apartment_id, check_in, check_out,
      guest_name, guest_email, guest_phone, guest_last_name,
      guest_date_of_birth, guest_place_of_birth, guest_nationality,
      guest_id_type, guest_id_card_number, guest_id_card_issued, guest_id_card_expiry,
      flight_outbound, flight_return, arrival_time, departure_time, airline,
      no_transfer, billing_name, billing_address, billing_city,
      billing_zip, billing_country, billing_fiscal_code,
      selected_services, notes, additional_guests,
    } = body;

    if (!apartment_id || !check_in || !check_out || !guest_name || !guest_email) {
      throw new Error("Dati mancanti nella richiesta");
    }

    // ---- Server-side price recomputation (trusted) ----
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new Error("Date non valide");
    }
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights < 1) throw new Error("Durata soggiorno non valida");

    // Fetch apartment from DB - trusted source for price & name
    const { data: apartment, error: aptError } = await serviceClient
      .from("apartments")
      .select("id, name, price_per_night, is_active")
      .eq("id", apartment_id)
      .single();

    if (aptError || !apartment) throw new Error("Appartamento non trovato");
    if (!apartment.is_active) throw new Error("Appartamento non disponibile");

    const trustedPricePerNight = Number(apartment.price_per_night);
    const accommodationTotal = Math.round(trustedPricePerNight * nights * 100) / 100;

    // Validate selected services against DB and recompute their totals
    const trustedServiceLineItems: Array<{ name: string; unit_price: number; quantity: number }> = [];
    let trustedServicesTotal = 0;

    if (Array.isArray(selected_services) && selected_services.length > 0) {
      // Extract IDs - support either array of ids or array of {id, quantity}
      const serviceEntries = selected_services.map((s: any) => {
        if (typeof s === "string") return { id: s, quantity: 1 };
        return { id: s.id, quantity: Math.max(1, parseInt(s.quantity ?? 1, 10) || 1) };
      }).filter((s: any) => s.id);

      if (serviceEntries.length > 0) {
        const ids = serviceEntries.map((s) => s.id);
        const { data: dbServices, error: svcError } = await serviceClient
          .from("additional_services")
          .select("id, name, price, is_active")
          .in("id", ids);

        if (svcError) throw new Error("Errore recupero servizi");

        for (const entry of serviceEntries) {
          const svc = dbServices?.find((d: any) => d.id === entry.id);
          if (!svc || !svc.is_active) continue;
          const unit = Number(svc.price);
          trustedServicesTotal += unit * entry.quantity;
          trustedServiceLineItems.push({
            name: svc.name,
            unit_price: unit,
            quantity: entry.quantity,
          });
        }
        trustedServicesTotal = Math.round(trustedServicesTotal * 100) / 100;
      }
    }

    const trustedTotalPrice = Math.round((accommodationTotal + trustedServicesTotal) * 100) / 100;
    const chosenPaymentType = "deposit";
    const depositAmount = Math.round(trustedTotalPrice * 0.2 * 100) / 100;
    const amountToCharge = depositAmount;

    // Generate a secure resume token (used for "Riprendi prenotazione" recovery email)
    const resumeToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    // 1. Create booking in DB with status "incomplete" (becomes "awaiting_verification" after Stripe success)
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        apartment_id,
        check_in,
        check_out,
        guest_name,
        guest_email,
        guest_phone,
        guest_last_name,
        guest_date_of_birth,
        guest_place_of_birth,
        guest_nationality,
        guest_id_type,
        guest_id_card_number,
        guest_id_card_issued,
        guest_id_card_expiry,
        flight_outbound: no_transfer ? null : flight_outbound,
        flight_return: no_transfer ? null : flight_return,
        arrival_time: no_transfer ? null : arrival_time,
        departure_time: no_transfer ? null : departure_time,
        airline: no_transfer ? null : airline,
        no_transfer: no_transfer || false,
        billing_name,
        billing_address,
        billing_city,
        billing_zip,
        billing_country,
        billing_fiscal_code,
        selected_services: selected_services || [],
        notes,
        user_id: user.id,
        status: "incomplete",
        total_price: trustedTotalPrice,
        payment_type: chosenPaymentType,
        amount_paid: 0,
        deposit_amount: depositAmount,
        resume_token: resumeToken,
      })
      .select()
      .single();

    if (bookingError) throw new Error(`Errore creazione prenotazione: ${bookingError.message}`);

    // 2. Insert additional guests
    if (additional_guests && additional_guests.length > 0) {
      const { error: guestsError } = await supabaseClient
        .from("booking_guests")
        .insert(
          additional_guests.map((g: any) => ({
            booking_id: booking.id,
            first_name: g.first_name,
            last_name: g.last_name,
            date_of_birth: g.date_of_birth,
            nationality: g.nationality,
            id_type: g.id_type,
            id_card_number: g.id_card_number,
            id_card_issued: g.id_card_issued,
            id_card_expiry: g.id_card_expiry,
          }))
        );
      if (guestsError) console.error("Error inserting guests:", guestsError);
    }

    // 3. Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build line items - deposit only, using TRUSTED amounts
    const lineItems: any[] = [{
      price_data: {
        currency: "eur",
        unit_amount: Math.round(amountToCharge * 100),
        product_data: {
          name: `Caparra — ${apartment.name}`,
          description: `Caparra 20% per soggiorno ${nights} notti (${check_in} → ${check_out})`,
        },
      },
      quantity: 1,
    }];

    const origin = req.headers.get("origin") || "https://bazhousedemo.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/prenotazione-successo/${booking.id}?payment=success`,
      cancel_url: `${origin}/pagamento-fallito?booking_id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        booking_code: booking.booking_code,
        payment_type: chosenPaymentType,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, booking_id: booking.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in create-booking-payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
