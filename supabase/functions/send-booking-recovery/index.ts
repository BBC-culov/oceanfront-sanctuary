import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Sends a "Riprendi prenotazione" email to users who started but never
 * completed a booking. Triggered by pg_cron (hourly). Only sends once per
 * booking (recovery_email_sent_at must be null).
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require service-role key (called by pg_cron only). Constant-time compare.
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!token || !serviceKey || !timingSafeEqual(token, serviceKey)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    // Find incomplete bookings older than 24h that have not received the recovery email yet
    const { data: bookings, error } = await serviceClient
      .from("bookings")
      .select("*, apartments(name)")
      .eq("status", "incomplete")
      .is("recovery_email_sent_at", null)
      .not("resume_token", "is", null)
      .lte("created_at", cutoff.toISOString())
      .limit(50);

    if (error) throw new Error(`Query error: ${error.message}`);

    // Hardcoded allowlist — never trust request Origin header (phishing risk)
    const ALLOWED_ORIGINS = ["https://bazhouse.it", "https://www.bazhouse.it", "https://bazhousedemo.vercel.app"];
    const reqOrigin = req.headers.get("origin");
    const origin = reqOrigin && ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[0];
    const sent: string[] = [];

    for (const booking of bookings || []) {
      if (!booking.guest_email || !booking.resume_token) continue;
      const apartmentName = (booking as any).apartments?.name || "Appartamento";
      const resumeUrl = `${origin}/riprendi/${booking.resume_token}`;

      try {
        await serviceClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: "booking-recovery",
            recipientEmail: booking.guest_email,
            idempotencyKey: `booking-recovery-${booking.id}`,
            templateData: {
              guestName: booking.guest_name,
              apartmentName,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              resumeUrl,
            },
          },
        });

        // Mark as sent so we never send a second one
        await serviceClient
          .from("bookings")
          .update({ recovery_email_sent_at: new Date().toISOString() })
          .eq("id", booking.id);

        sent.push(booking.id);
      } catch (emailErr) {
        console.error(`Failed to send recovery email for ${booking.id}:`, emailErr);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, recovery_emails_sent: sent.length, ids: sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-booking-recovery:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
