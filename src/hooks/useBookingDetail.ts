import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads the customer-facing booking detail: booking row, apartment, modification
 * requests, and handles Stripe payment return redirects.
 */
export function useBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingMod, setPendingMod] = useState<any>(null);
  const [modHistory, setModHistory] = useState<any[]>([]);
  const [payingMod, setPayingMod] = useState(false);

  const reloadBooking = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !id) return;
    const { data: b } = await supabase
      .from("bookings").select("*")
      .eq("id", id).eq("user_id", session.user.id).single();
    if (b) setBooking(b);
    const { data: all } = await supabase
      .from("booking_modification_requests").select("*")
      .eq("booking_id", id)
      .order("created_at", { ascending: false });
    const list = all ?? [];
    setPendingMod(list.find((r: any) => r.status === "pending") ?? null);
    setModHistory(list.filter((r: any) => r.status !== "pending"));
  };

  // Handle payment success redirects
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "modification_success" && id && sessionId) {
      (async () => {
        try {
          await supabase.functions.invoke("confirm-booking-payment", {
            body: { booking_id: id, type: "modification", session_id: sessionId },
          });
          toast.success("Differenza modifica pagata!");
          await reloadBooking();
        } catch (e) { console.error(e); }
        setSearchParams({}, { replace: true });
      })();
      return;
    }
    if (payment === "success" && id) {
      navigate(`/prenotazione-successo/${id}?payment=success${sessionId ? `&session_id=${sessionId}` : ""}`, { replace: true });
      return;
    }
    // Map admin-generated link returns + balance returns to a confirm type
    const confirmTypeMap: Record<string, "initial" | "balance" | "full"> = {
      balance_success: "balance",
      deposit_success: "initial",
      full_success: "full",
    };
    const confirmType = payment ? confirmTypeMap[payment] : undefined;
    if (confirmType && id && sessionId) {
      (async () => {
        try {
          await supabase.functions.invoke("confirm-booking-payment", {
            body: { booking_id: id, type: confirmType, session_id: sessionId },
          });
          toast.success(
            confirmType === "balance"
              ? "Saldo pagato con successo!"
              : "Pagamento ricevuto con successo!"
          );
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: b } = await supabase
              .from("bookings").select("*")
              .eq("id", id).eq("user_id", session.user.id).single();
            if (b) setBooking(b);
          }
        } catch (e) {
          console.error("Confirm error:", e);
        }
        setSearchParams({}, { replace: true });
      })();
    }
  }, [searchParams, id, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/registrati"); return; }

      const { data: b } = await supabase
        .from("bookings").select("*")
        .eq("id", id!).eq("user_id", session.user.id).single();

      if (!b) { navigate("/profilo#prenotazioni"); return; }
      setBooking(b);

      const { data: apt } = await supabase
        .from("apartments")
        .select("name, slug, images, address")
        .eq("id", b.apartment_id)
        .single();
      setApartment(apt);

      const { data: all } = await supabase
        .from("booking_modification_requests").select("*")
        .eq("booking_id", id!)
        .order("created_at", { ascending: false });
      const list = all ?? [];
      setPendingMod(list.find((r: any) => r.status === "pending") ?? null);
      setModHistory(list.filter((r: any) => r.status !== "pending"));

      setLoading(false);
    };
    load();
  }, [id, navigate]);

  /** Sends the guest to the Stripe link for the modification difference. */
  const payModificationDiff = async () => {
    if (!booking?.modification_payment_url) return;
    setPayingMod(true);
    try {
      window.location.href = booking.modification_payment_url;
    } finally {
      setPayingMod(false);
    }
  };

  /** Cancels the booking. Returns true on success. */
  const cancelBooking = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" as any })
        .eq("id", booking.id);
      if (error) throw error;
      toast.success("Prenotazione annullata. Per il rimborso del saldo, contatta l'assistenza.");
      window.location.reload();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'annullamento");
      return false;
    }
  };

  return {
    navigate,
    booking, apartment, loading,
    pendingMod, modHistory,
    payingMod, payModificationDiff,
    reloadBooking, cancelBooking,
  };
}
