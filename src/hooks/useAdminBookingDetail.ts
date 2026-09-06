import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { extractEdgeError } from "@/lib/edgeError";

/**
 * Owns all data access for the admin booking detail page:
 * booking + apartment + guests + manual payments, realtime sync,
 * status updates and the Stripe balance-link lifecycle.
 */
export function useAdminBookingDetail(id: string | undefined, onMissing: () => void) {
  const [booking, setBooking] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [manualPayments, setManualPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [generatingLink, setGeneratingLink] = useState(false);
  const [balanceLink, setBalanceLink] = useState<string | null>(null);
  const [balanceSessionId, setBalanceSessionId] = useState<string | null>(null);
  const [linkExpiresAt, setLinkExpiresAt] = useState<number | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    const [bRes, mpRes, gRes] = await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).single(),
      supabase.from("manual_payments").select("*").eq("booking_id", id).order("created_at", { ascending: false }),
      supabase.from("booking_guests").select("*").eq("booking_id", id),
    ]);
    if (bRes.data) setBooking(bRes.data);
    setManualPayments(mpRes.data ?? []);
    setGuests(gRes.data ?? []);
  }, [id]);

  // Realtime sync: refresh booking + guests when changed (e.g., after a modification approval)
  useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`booking-detail-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `id=eq.${id}` },
        () => { reload(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "booking_guests", filter: `booking_id=eq.${id}` },
        () => { reload(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "booking_modification_requests", filter: `booking_id=eq.${id}` },
        () => { reload(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, reload]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: b } = await supabase.from("bookings").select("*").eq("id", id!).single();
      if (!b) { onMissing(); return; }
      setBooking(b);

      // Restore persisted balance link
      const bAny = b as any;
      if (bAny.balance_payment_url && bAny.balance_link_expires_at) {
        setBalanceLink(bAny.balance_payment_url);
        setBalanceSessionId(bAny.balance_session_id || null);
        setLinkExpiresAt(bAny.balance_link_expires_at);
      }

      const [aptRes, guestsRes, mpRes] = await Promise.all([
        supabase.from("apartments").select("name, slug, images").eq("id", bAny.apartment_id).single(),
        supabase.from("booking_guests").select("*").eq("booking_id", bAny.id),
        supabase.from("manual_payments").select("*").eq("booking_id", bAny.id).order("created_at", { ascending: false }),
      ]);
      setApartment(aptRes.data);
      setGuests(guestsRes.data ?? []);
      setManualPayments(mpRes.data ?? []);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("bookings").update({ status } as any).eq("id", id!);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setBooking((prev: any) => ({ ...prev, status }));
      toast({ title: "Stato aggiornato" });
    }
  };

  const generateLink = async () => {
    setGeneratingLink(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-balance-payment-link", {
        body: { booking_id: booking.id },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      setBalanceLink(data.url);
      setBalanceSessionId(data.session_id);
      setLinkExpiresAt(data.expires_at);
      toast({ title: "Link generato!", description: "Copialo e invialo al cliente." });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Errore nella generazione del link", variant: "destructive" });
    } finally {
      setGeneratingLink(false);
    }
  };

  const regenerateLink = async () => {
    setGeneratingLink(true);
    setEmailSent(false);
    try {
      const { data, error } = await supabase.functions.invoke("create-balance-payment-link", {
        body: { booking_id: booking.id, expire_session_id: balanceSessionId },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      setBalanceLink(data.url);
      setBalanceSessionId(data.session_id);
      setLinkExpiresAt(data.expires_at);
      toast({ title: "Link rigenerato!", description: "Il link precedente è stato invalidato. Nuovo link valido per 24 ore." });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Errore nella rigenerazione del link", variant: "destructive" });
    } finally {
      setGeneratingLink(false);
    }
  };

  const sendLinkEmail = async () => {
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-balance-payment-link", {
        body: { booking_id: booking.id, action: "send_email", payment_link: balanceLink },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      setEmailSent(true);
      toast({ title: "Email inviata!", description: `Email con link di pagamento inviata a ${booking.guest_email}` });
    } catch (e: any) {
      toast({ title: "Errore invio email", description: e.message || "Errore nell'invio dell'email", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  return {
    booking, apartment, guests, manualPayments, loading,
    reload, updateStatus,
    balanceLink, linkExpiresAt, generatingLink, sendingEmail, emailSent,
    generateLink, regenerateLink, sendLinkEmail,
  };
}
