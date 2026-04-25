import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import {
  User, Phone, Save, Loader2, CheckCircle, AlertCircle,
  Calendar, Clock, Tag, Hash, Trash2, AlertTriangle, X, ChevronRight,
  Mail, Shield, Edit3, KeyRound, Eye, EyeOff, Headphones, Building2, CalendarCheck,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PhonePrefixInput from "@/components/PhonePrefixInput";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri").max(50),
  lastName: z.string().trim().min(2, "Il cognome deve avere almeno 2 caratteri").max(50),
  phone: z.string().trim().regex(/^\+?[0-9\s]{7,15}$/, "Numero di telefono non valido").or(z.literal("")),
});

import { getStatusConfig, type BookingStatus } from "@/lib/bookingStatus";

interface RealBooking {
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

// Animated section wrapper with stagger
const AnimatedSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay,
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Animated input with focus glow
const AnimatedInput = ({
  icon: Icon,
  label,
  error,
  delay = 0,
  className: extraClassName,
  ...props
}: {
  icon?: React.ElementType;
  label: string;
  error?: string;
  delay?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
    >
      <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      <motion.div
        className="relative"
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-3 rounded-lg bg-muted/50 border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-300 ${
            focused
              ? "border-primary/50 ring-2 ring-primary/20 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)]"
              : error
                ? "border-destructive/50"
                : "border-border"
          } ${extraClassName || ""}`}
        />
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Profilo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [bookings, setBookings] = useState<RealBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const bookingsRef = useRef<HTMLDivElement>(null);

  // Scroll to bookings section if hash is #prenotazioni
  useEffect(() => {
    if (location.hash === "#prenotazioni" && bookingsRef.current && !loading) {
      setTimeout(() => {
        bookingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }
  }, [location.hash, loading]);

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
      // Fetch bookings
      const { data: bData } = await supabase
        .from("bookings")
        .select("id, check_in, check_out, status, total_price, guest_name, guest_last_name, apartment_id, created_at, booking_code")
        .eq("user_id", session.user.id)
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

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Inserisci la tua password per confermare");
      return;
    }
    setDeleteError("");
    setDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/registrati");
        return;
      }

      const res = await supabase.functions.invoke("delete-account", {
        body: { password: deletePassword },
      });

      if (res.error || res.data?.error) {
        setDeleteError(res.data?.error || "Errore durante l'eliminazione");
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      navigate("/");
    } catch {
      setDeleteError("Errore di connessione. Riprova.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase();

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Animated Header with Avatar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="text-center mb-4"
          >
            {/* Avatar circle */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="relative w-24 h-24 mx-auto mb-5"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center border-2 border-primary/20">
                <span className="font-serif text-2xl text-primary">
                  {initials || <User className="w-10 h-10" />}
                </span>
              </div>
              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-serif text-3xl sm:text-4xl text-foreground mb-2"
            >
              Il mio Profilo
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center justify-center gap-2"
            >
              <Mail size={14} className="text-muted-foreground" />
              <p className="font-sans text-sm text-muted-foreground">{userEmail}</p>
            </motion.div>
          </motion.div>

          {/* Section 1: Profile Info */}
          <AnimatedSection delay={0.15} className="bg-card rounded-2xl border border-border/60 shadow-sm group">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 text-primary" />
              </motion.div>
              <h2 className="font-serif text-xl text-foreground">Informazioni Personali</h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Email (read-only) */}
              <AnimatedInput
                icon={Mail}
                label="Email"
                type="email"
                value={userEmail}
                readOnly
                disabled
                delay={0.05}
                className="opacity-60 cursor-not-allowed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AnimatedInput
                  label="Nome"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Il tuo nome"
                  error={errors.firstName}
                  delay={0.1}
                />
                <AnimatedInput
                  label="Cognome"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Il tuo cognome"
                  error={errors.lastName}
                  delay={0.15}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
              >
                <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                  Telefono
                </label>
                <PhonePrefixInput
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                <AnimatePresence>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans"
                    >
                      <AlertCircle size={12} />
                      {errors.phone}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Save button */}
              <motion.div
                className="flex flex-wrap items-center gap-4 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={!saving ? { scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.3)" } : {}}
                  whileTap={!saving ? { scale: 0.97 } : {}}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-70"
                >
                  <AnimatePresence mode="wait">
                    {saving ? (
                      <motion.span key="saving" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
                        <Loader2 size={16} className="animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span key="save" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
                        <Save size={16} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  Salva Modifiche
                </motion.button>

                <AnimatePresence>
                  {saveMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: -15, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -15, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`flex items-center gap-1.5 text-sm font-sans px-3 py-1.5 rounded-lg ${
                        saveMessage.type === "success"
                          ? "text-primary bg-primary/10"
                          : "text-destructive bg-destructive/10"
                      }`}
                    >
                      {saveMessage.type === "success" ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                          <CheckCircle size={16} />
                        </motion.span>
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      {saveMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Section 2: Bookings */}
          <div ref={bookingsRef}>
            <AnimatedSection delay={0.3} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                </motion.div>
                <h2 className="font-serif text-xl text-foreground">Gestisci Prenotazioni</h2>
              </div>

              <div className="p-6">
                {bookingsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Calendar className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                    </motion.div>
                    <p className="font-sans text-muted-foreground text-sm mb-1">Nessuna prenotazione</p>
                    <p className="font-sans text-muted-foreground/60 text-xs">Le tue prenotazioni appariranno qui</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking, idx) => {
                      const status = statusConfig[booking.status];
                      const nights = differenceInDays(new Date(booking.check_out), new Date(booking.check_in));
                      return (
                        <Link to={`/prenotazione/${booking.id}`} key={booking.id}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx, duration: 0.4 }}
                            whileHover={{ x: 4, boxShadow: "0 4px 15px -3px hsl(var(--primary) / 0.1)" }}
                            className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                {booking.booking_code && (
                                  <span className="font-mono text-[10px] tracking-wider text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full">
                                    #{booking.booking_code}
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans ${status.bg} ${status.color}`}>
                                  {status.label}
                                </span>
                                {booking.total_price && (
                                  <span className="text-xs font-sans font-semibold text-foreground">€{booking.total_price}</span>
                                )}
                              </div>
                              <p className="font-sans text-sm text-foreground font-medium flex items-center gap-1.5">
                                <Building2 size={13} className="text-muted-foreground" />
                                {booking.apartment_name || "Appartamento"}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                                  <CalendarCheck size={11} />
                                  {format(new Date(booking.check_in), "d MMM", { locale: it })} → {format(new Date(booking.check_out), "d MMM yyyy", { locale: it })}
                                </span>
                                <span className="text-xs text-muted-foreground font-sans">
                                  {nights} notti
                                </span>
                              </div>
                            </div>
                            <motion.div
                              className="ml-4 p-2 rounded-lg text-muted-foreground group-hover:text-primary transition-colors"
                              whileHover={{ x: 3 }}
                            >
                              <ChevronRight size={18} />
                            </motion.div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Section 3: Export Data (GDPR) */}
          <AnimatedSection delay={0.38} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Download className="w-4 h-4 text-primary" />
              </motion.div>
              <h2 className="font-serif text-xl text-foreground">Esporta i Tuoi Dati</h2>
            </div>
            <div className="p-6">
              <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
                Ai sensi del GDPR, puoi scaricare una copia di tutti i tuoi dati personali in formato JSON.
              </p>
              <motion.button
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const uid = session.user.id;
                  const [profileRes, bookingsRes, guestsRes] = await Promise.all([
                    supabase.from("profiles").select("*").eq("user_id", uid).single(),
                    supabase.from("bookings").select("*").eq("user_id", uid),
                    supabase.from("booking_guests").select("*, bookings!inner(user_id)").eq("bookings.user_id", uid),
                  ]);
                  const exportData = {
                    exported_at: new Date().toISOString(),
                    email: session.user.email,
                    profile: profileRes.data,
                    bookings: bookingsRes.data,
                    booking_guests: guestsRes.data,
                  };
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `bazhouse-dati-${format(new Date(), "yyyy-MM-dd")}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300"
              >
                <Download size={15} />
                Scarica i miei dati
              </motion.button>
            </div>
          </AnimatedSection>

          {/* Section 4: Account Management */}
          <AnimatedSection delay={0.45} className="bg-card rounded-2xl border border-destructive/20 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <Shield className="w-4 h-4 text-destructive" />
              </motion.div>
              <h2 className="font-serif text-xl text-foreground">Gestione Account</h2>
            </div>

            <div className="p-6">
              <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
                Gestisci la sicurezza del tuo account. Puoi aggiornare la password o eliminare definitivamente il tuo account.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => navigate("/registrati", { state: { forgotPassword: true } })}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/30 text-primary rounded-lg font-sans text-sm tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <KeyRound size={15} />
                  Aggiorna Password
                </motion.button>
                <motion.button
                  onClick={() => { setShowDeleteModal(true); setDeletePassword(""); setDeleteError(""); }}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--destructive) / 0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-destructive/30 text-destructive rounded-lg font-sans text-sm tracking-widest uppercase hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                >
                  <Trash2 size={15} />
                  Elimina Account
                </motion.button>
              </div>
            </div>
          </AnimatedSection>

          {/* Section 4: Assistenza */}
          <AnimatedSection delay={0.55} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Headphones className="w-4 h-4 text-primary" />
              </motion.div>
              <h2 className="font-serif text-xl text-foreground">Assistenza</h2>
            </div>

            <div className="p-6">
              <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
                Hai bisogno di aiuto o hai domande sulla tua prenotazione? Il nostro team è a tua disposizione per assisterti.
              </p>
              <motion.button
                onClick={() => navigate("/contatti")}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.2)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300"
              >
                <Headphones size={15} />
                Richiedi Assistenza
              </motion.button>
            </div>
          </AnimatedSection>
        </div>
      </main>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="relative bg-background rounded-2xl border border-border shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5"
              >
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-xl text-foreground mb-2"
              >
                Sei sicuro?
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-sans text-sm text-muted-foreground mb-5 leading-relaxed"
              >
                Questa azione è irreversibile. Inserisci la tua password per confermare l'eliminazione.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-5"
              >
                <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                    placeholder="Inserisci la tua password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:border-destructive/50 focus:ring-2 focus:ring-destructive/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showDeletePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {deleteError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-sans"
                    >
                      <AlertCircle size={12} />
                      {deleteError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <motion.button
                  onClick={() => setShowDeleteModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 border border-border rounded-lg font-sans text-sm text-foreground hover:bg-muted transition-all duration-300"
                >
                  Annulla
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword.trim()}
                  whileHover={!deleting && deletePassword.trim() ? { scale: 1.02 } : {}}
                  whileTap={!deleting && deletePassword.trim() ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-lg font-sans text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-all duration-300"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
                  Elimina
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </PageTransition>
  );
};

export default Profilo;
