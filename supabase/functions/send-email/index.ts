import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Base layout ── */
function baseLayout(bodyContent: string) {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;overflow:hidden">
        <tr><td style="background:#1a1a1a;padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:300;letter-spacing:0.1em;font-family:Georgia,serif">BAZ HOUSE</h1>
        </td></tr>
        <tr><td style="padding:40px">
          ${bodyContent}
        </td></tr>
        <tr><td style="padding:24px 40px;background:#fafafa;text-align:center;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#999">Baz House · Boa Vista, Capo Verde</p>
          <p style="margin:4px 0 0;font-size:11px;color:#bbb">© ${new Date().getFullYear()} Baz House. Tutti i diritti riservati.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Templates ── */

function welcomeHtml(data: { guestName: string }) {
  return baseLayout(`
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:300;color:#1a1a1a;font-family:Georgia,serif">Benvenuto su Baz House! 🌴</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6">
      Ciao <strong>${data.guestName}</strong>,<br>
      grazie per esserti registrato su Baz House! Siamo felici di averti con noi.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6">
      Ora puoi esplorare i nostri appartamenti esclusivi vista oceano a Boa Vista, Capo Verde, e prenotare la tua prossima vacanza da sogno.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto">
      <tr><td style="background:#1a1a1a;padding:14px 32px;text-align:center">
        <a href="https://bazhousedemo.vercel.app/appartamenti" style="color:#ffffff;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.15em">Scopri gli appartamenti</a>
      </td></tr>
    </table>
  `);
}

function bookingConfirmationHtml(data: {
  guestName: string;
  apartmentName: string;
  checkIn: string;
  checkOut: string;
  bookingCode: string;
  totalPrice: number;
  amountPaid: number;
  paymentType: string;
}) {
  const balance = data.totalPrice - data.amountPaid;
  const paymentInfo =
    data.paymentType === "deposit"
      ? `<p style="margin:0 0 8px"><strong>Caparra versata:</strong> €${data.amountPaid.toFixed(2)}</p>
         <p style="margin:0 0 8px"><strong>Saldo rimanente:</strong> €${balance.toFixed(2)} (da versare almeno 7 giorni prima del check-in)</p>`
      : `<p style="margin:0 0 8px"><strong>Importo pagato:</strong> €${data.amountPaid.toFixed(2)}</p>`;

  return baseLayout(`
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:300;color:#1a1a1a;font-family:Georgia,serif">Prenotazione Confermata</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6">
      Ciao <strong>${data.guestName}</strong>,<br>
      la tua prenotazione è stata confermata con successo!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:24px;margin:0 0 24px">
      <tr><td>
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#999">Dettagli prenotazione</p>
        <p style="margin:0 0 8px"><strong>Codice:</strong> ${data.bookingCode}</p>
        <p style="margin:0 0 8px"><strong>Appartamento:</strong> ${data.apartmentName}</p>
        <p style="margin:0 0 8px"><strong>Check-in:</strong> ${data.checkIn}</p>
        <p style="margin:0 0 8px"><strong>Check-out:</strong> ${data.checkOut}</p>
        <p style="margin:0 0 8px"><strong>Totale:</strong> €${data.totalPrice.toFixed(2)}</p>
        ${paymentInfo}
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6">
      Puoi visualizzare i dettagli della tua prenotazione nella sezione "Le mie prenotazioni" del tuo profilo.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto">
      <tr><td style="background:#1a1a1a;padding:14px 32px;text-align:center">
        <a href="https://bazhousedemo.vercel.app/profilo" style="color:#ffffff;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.15em">Le mie prenotazioni</a>
      </td></tr>
    </table>
  `);
}

function balancePaidHtml(data: {
  guestName: string;
  apartmentName: string;
  bookingCode: string;
  totalPrice: number;
}) {
  return baseLayout(`
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:300;color:#1a1a1a;font-family:Georgia,serif">Saldo Completato ✓</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6">
      Ciao <strong>${data.guestName}</strong>,<br>
      il saldo della tua prenotazione <strong>${data.bookingCode}</strong> per <strong>${data.apartmentName}</strong> è stato completato con successo.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:24px;margin:0 0 24px;border-left:4px solid #22c55e">
      <tr><td>
        <p style="margin:0;font-size:15px;color:#166534"><strong>Importo totale pagato: €${data.totalPrice.toFixed(2)}</strong></p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
      Non vediamo l'ora di accoglierti a Boa Vista!
    </p>
  `);
}

function balanceReminderHtml(data: {
  guestName: string;
  apartmentName: string;
  bookingCode: string;
  totalPrice: number;
  amountPaid: number;
  checkIn: string;
  daysLeft: number;
}) {
  const balance = data.totalPrice - data.amountPaid;
  return baseLayout(`
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:300;color:#1a1a1a;font-family:Georgia,serif">Promemoria: Saldo in Scadenza</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6">
      Ciao <strong>${data.guestName}</strong>,<br>
      ti ricordiamo che il saldo della tua prenotazione <strong>${data.bookingCode}</strong> per <strong>${data.apartmentName}</strong> deve essere completato prima del check-in.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;padding:24px;margin:0 0 24px;border-left:4px solid #f59e0b">
      <tr><td>
        <p style="margin:0 0 8px;font-size:15px;color:#92400e"><strong>Saldo rimanente: €${balance.toFixed(2)}</strong></p>
        <p style="margin:0;font-size:13px;color:#92400e">Check-in: ${data.checkIn} (tra ${data.daysLeft} giorni)</p>
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6">
      Accedi al tuo profilo per completare il pagamento del saldo.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto">
      <tr><td style="background:#1a1a1a;padding:14px 32px;text-align:center">
        <a href="https://bazhousedemo.vercel.app/profilo" style="color:#ffffff;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:0.15em">Paga il saldo</a>
      </td></tr>
    </table>
  `);
}

function adminNotificationHtml(data: {
  guestName: string;
  guestEmail: string;
  apartmentName: string;
  checkIn: string;
  checkOut: string;
  bookingCode: string;
  totalPrice: number;
  amountPaid: number;
  paymentType: string;
  type: string;
}) {
  const title = data.type === "balance" ? "Saldo Ricevuto" : "Nuova Prenotazione";
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;overflow:hidden">
        <tr><td style="background:#1a1a1a;padding:24px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:300;letter-spacing:0.1em;font-family:Georgia,serif">BAZ HOUSE — Admin</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a">${title}</h2>
          <p style="margin:0 0 8px"><strong>Ospite:</strong> ${data.guestName} (${data.guestEmail})</p>
          <p style="margin:0 0 8px"><strong>Codice:</strong> ${data.bookingCode}</p>
          <p style="margin:0 0 8px"><strong>Appartamento:</strong> ${data.apartmentName}</p>
          <p style="margin:0 0 8px"><strong>Date:</strong> ${data.checkIn} → ${data.checkOut}</p>
          <p style="margin:0 0 8px"><strong>Totale:</strong> €${data.totalPrice.toFixed(2)}</p>
          <p style="margin:0 0 8px"><strong>Pagato:</strong> €${data.amountPaid.toFixed(2)} (${data.paymentType === "deposit" ? "caparra" : "intero"})</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Send via Resend Gateway ── */
async function sendViaResend(to: string, subject: string, html: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurata");

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY non configurata");

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: "Baz House <noreply@bazhouse.it>",
      to: [to],
      subject,
      html,
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(`Resend error [${res.status}]: ${JSON.stringify(result)}`);
  }
  return result;
}

/* ── Main handler ── */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (!type || !data) {
      return new Response(JSON.stringify({ error: "type and data are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    if (type === "welcome") {
      const html = welcomeHtml(data);
      results.push(
        await sendViaResend(data.guestEmail, "Benvenuto su Baz House! 🌴", html)
      );
    } else if (type === "booking_confirmation") {
      const guestHtml = bookingConfirmationHtml(data);
      results.push(
        await sendViaResend(data.guestEmail, `Prenotazione confermata — ${data.bookingCode}`, guestHtml)
      );
      const adminHtml = adminNotificationHtml({ ...data, type: "initial" });
      results.push(
        await sendViaResend("info@bazhouse.it", `Nuova prenotazione ${data.bookingCode}`, adminHtml)
      );
    } else if (type === "balance_paid") {
      const guestHtml = balancePaidHtml(data);
      results.push(
        await sendViaResend(data.guestEmail, `Saldo completato — ${data.bookingCode}`, guestHtml)
      );
      const adminHtml = adminNotificationHtml({ ...data, type: "balance" });
      results.push(
        await sendViaResend("info@bazhouse.it", `Saldo ricevuto ${data.bookingCode}`, adminHtml)
      );
    } else if (type === "balance_reminder") {
      const html = balanceReminderHtml(data);
      results.push(
        await sendViaResend(data.guestEmail, `Promemoria saldo — ${data.bookingCode}`, html)
      );
    } else {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});