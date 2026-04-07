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

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user?.email) throw new Error("Utente non autenticato");

    const body = await req.json();
    const {
      apartment_id, check_in, check_out, apartment_name,
      guest_name, guest_email, guest_phone, guest_last_name,
      guest_date_of_birth, guest_place_of_birth, guest_nationality,
      guest_id_type, guest_id_card_number, guest_id_card_issued, guest_id_card_expiry,
      flight_outbound, flight_return, arrival_time, departure_time, airline,
      no_transfer, billing_name, billing_address, billing_city,
      billing_zip, billing_country, billing_fiscal_code,
      selected_services, notes, additional_guests,
      price_per_night, nights, total_price,
      services_total, services_line_items,
      payment_type, // "deposit" or "full"
    } = body;

    if (!apartment_id || !check_in || !check_out || !guest_name || !guest_email) {
      throw new Error("Dati mancanti nella richiesta");
    }

    const chosenPaymentType = payment_type === "deposit" ? "deposit" : "full";
    const depositAmount = chosenPaymentType === "deposit" ? Math.round(total_price * 0.2 * 100) / 100 : total_price;
    const amountToCharge = depositAmount;

    // 1. Create booking in DB with status "pending"
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
        status: "pending",
        total_price,
        payment_type: chosenPaymentType,
        amount_paid: 0,
        deposit_amount: chosenPaymentType === "deposit" ? depositAmount : total_price,
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

    // Build line items based on payment type
    const lineItems: any[] = [];

    if (chosenPaymentType === "deposit") {
      // Single line item for the deposit
      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amountToCharge * 100),
          product_data: {
            name: `Caparra — ${apartment_name}`,
            description: `Caparra 20% per soggiorno ${nights} notti (${check_in} → ${check_out})`,
          },
        },
        quantity: 1,
      });
    } else {
      // Full payment: accommodation + services
      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(price_per_night * 100),
          product_data: {
            name: `${apartment_name} — Soggiorno ${nights} notti`,
            description: `Check-in: ${check_in} · Check-out: ${check_out}`,
          },
        },
        quantity: nights,
      });

      if (services_line_items && services_line_items.length > 0) {
        for (const svc of services_line_items) {
          lineItems.push({
            price_data: {
              currency: "eur",
              unit_amount: Math.round(svc.unit_price * 100),
              product_data: { name: svc.name },
            },
            quantity: svc.quantity,
          });
        }
      }
    }

    const origin = req.headers.get("origin") || "https://bazhousedemo.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/prenotazione/${booking.id}?payment=success`,
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
