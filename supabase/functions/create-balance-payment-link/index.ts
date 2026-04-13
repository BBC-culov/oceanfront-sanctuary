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
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("Non autenticato");

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check admin role
    const { data: isAdmin } = await serviceClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Accesso non autorizzato");

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("ID prenotazione mancante");

    // Fetch booking
    const { data: booking, error: bookingError } = await serviceClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) throw new Error("Prenotazione non trovata");
    if (booking.status !== "confirmed") throw new Error("La prenotazione non è confermata");
    if (booking.amount_paid >= booking.total_price) throw new Error("La prenotazione è già stata saldata");

    const remainingAmount = booking.total_price - booking.amount_paid;

    // Get apartment name
    const { data: apt } = await serviceClient
      .from("apartments")
      .select("name")
      .eq("id", booking.apartment_id)
      .single();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or skip existing customer
    const customers = await stripe.customers.list({ email: booking.guest_email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://bazhousedemo.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : booking.guest_email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(remainingAmount * 100),
            product_data: {
              name: `Saldo — ${apt?.name || "Prenotazione"}`,
              description: `Saldo rimanente prenotazione #${booking.booking_code}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/prenotazione/${booking.id}?payment=balance_success`,
      cancel_url: `${origin}/prenotazione/${booking.id}`,
      metadata: {
        booking_id: booking.id,
        booking_code: booking.booking_code,
        payment_type: "balance",
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in create-balance-payment-link:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
