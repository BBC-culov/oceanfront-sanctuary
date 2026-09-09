import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { BookingStatus } from "@/lib/bookingStatus";

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri").max(50),
  lastName: z.string().trim().min(2, "Il cognome deve avere almeno 2 caratteri").max(50),
  phone: z.string().trim().regex(/^\+?[0-9\s]{7,15}$/, "Numero di telefono non valido").or(z.literal("")),
});

export interface RealBooking {
  id: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  total_price: number | null;
  guest_name: string;
  guest_last_name: string | null;
  apartment_id: string;
  apartment_name?: string;
  created_at: string;
  booking_code?: string;
}

/**
 * Data access + actions for the customer area: profile fields, bookings list,
 * profile update, GDPR export and account deletion.
 */
export function useProfiloData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [bookings, setBookings] = useState<RealBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/registrati");
        return;
      }
      setUserEmail(session.user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setForm({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          phone: data.phone || "",
        });
      }

      const { data: bData } = await supabase
        .from("bookings")
        .select("id, check_in, check_out, status, total_price, guest_name, guest_last_name, apartment_id, created_at, booking_code")
        .eq("user_id", session.user.id)
        .neq("status", "incomplete")
        .order("created_at", { ascending: false });

      if (bData && bData.length > 0) {
        const aptIds = [...new Set(bData.map((b: any) => b.apartment_id))];
        const { data: apts } = await supabase.from("apartments").select("id, name").in("id", aptIds);
        const aptMap = new Map((apts ?? []).map((a: any) => [a.id, a.name]));
        setBookings(bData.map((b: any) => ({ ...b, apartment_name: aptMap.get(b.apartment_id) ?? "—" })));
      }
      setBookingsLoading(false);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/registrati");
    });

    loadProfile();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    setErrors({});
    setSaveMessage(null);

    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone.trim() || null,
      })
      .eq("user_id", session.user.id);

    setSaving(false);
    if (error) {
      setSaveMessage({ type: "error", text: "Errore nel salvataggio. Riprova." });
    } else {
      setSaveMessage({ type: "success", text: "Profilo aggiornato con successo!" });
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  /** Deletes the account after password confirmation. Returns an error message or null. */
  const deleteAccount = async (password: string): Promise<string | null> => {
    if (!password.trim()) return "Inserisci la tua password per confermare";
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/registrati");
        return null;
      }

      const res = await supabase.functions.invoke("delete-account", { body: { password } });
      if (res.error || res.data?.error) {
        setDeleting(false);
        return res.data?.error || "Errore durante l'eliminazione";
      }

      await supabase.auth.signOut();
      navigate("/");
      return null;
    } catch {
      setDeleting(false);
      return "Errore di connessione. Riprova.";
    }
  };

  /** GDPR export: downloads profile, bookings and guests as a JSON file. */
  const exportData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;
    const [profileRes, bookingsRes, guestsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).single(),
      supabase.from("bookings").select("*").eq("user_id", uid),
      supabase.from("booking_guests").select("*, bookings!inner(user_id)").eq("bookings.user_id", uid),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      email: session.user.email,
      profile: profileRes.data,
      bookings: bookingsRes.data,
      booking_guests: guestsRes.data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bazhouse-dati-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    navigate,
    loading, saving, deleting,
    saveMessage, errors,
    userEmail, form, setForm,
    bookings, bookingsLoading,
    handleSave, deleteAccount, exportData,
  };
}
