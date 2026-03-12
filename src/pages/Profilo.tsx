import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  User, Phone, Save, Loader2, CheckCircle, AlertCircle,
  Calendar, Clock, Tag, Hash, Trash2, AlertTriangle, X, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const phoneSchema = z.string().trim().regex(/^\+?[0-9\s]{7,15}$/, "Inserisci un numero di telefono valido");
const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri").max(50),
  lastName: z.string().trim().min(2, "Il cognome deve avere almeno 2 caratteri").max(50),
  phone: z.string().trim().regex(/^\+?[0-9\s]{7,15}$/, "Numero di telefono non valido").or(z.literal("")),
});

type BookingStatus = "confirmed" | "pending" | "cancelled";

interface Booking {
  id: string;
  date: string;
  time: string;
  service: string;
  status: BookingStatus;
}

// Placeholder bookings — will be replaced with real data when booking system is built
const mockBookings: Booking[] = [];

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confermata", color: "text-primary", bg: "bg-primary/10" },
  pending: { label: "In attesa", color: "text-accent-foreground", bg: "bg-accent/30" },
  cancelled: { label: "Cancellata", color: "text-destructive", bg: "bg-destructive/10" },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const Profilo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [bookings] = useState<Booking[]>(mockBookings);

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
    setDeleting(true);
    // Sign out the user — actual account deletion requires admin/edge function
    await supabase.auth.signOut();
    setDeleting(false);
    navigate("/");
  };

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Page Header */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-4"
          >
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">Il mio Profilo</h1>
            <p className="font-sans text-sm text-muted-foreground">{userEmail}</p>
          </motion.div>

          {/* Section 1: Profile Info */}
          <motion.section
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Informazioni Personali</h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Il tuo nome"
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans">
                      <AlertCircle size={12} />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                    Cognome
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Il tuo cognome"
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans">
                      <AlertCircle size={12} />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                  Telefono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+39 333 1234567"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans">
                    <AlertCircle size={12} />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Save */}
              <div className="flex items-center gap-4 pt-2">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={!saving ? { scale: 1.02 } : {}}
                  whileTap={!saving ? { scale: 0.98 } : {}}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salva Modifiche
                </motion.button>

                <AnimatePresence>
                  {saveMessage && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`flex items-center gap-1.5 text-sm font-sans ${
                        saveMessage.type === "success" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {saveMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      {saveMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

          {/* Section 2: Bookings */}
          <motion.section
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Gestisci Prenotazioni</h2>
            </div>

            <div className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-sans text-muted-foreground text-sm mb-1">Nessuna prenotazione</p>
                  <p className="font-sans text-muted-foreground/60 text-xs">Le tue prenotazioni appariranno qui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const status = statusConfig[booking.status];
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                              <Hash size={10} />
                              {booking.id}
                            </span>
                          </div>
                          <p className="font-sans text-sm text-foreground font-medium flex items-center gap-1.5">
                            <Tag size={13} className="text-muted-foreground" />
                            {booking.service}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                              <Calendar size={11} />
                              {booking.date}
                            </span>
                            <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                              <Clock size={11} />
                              {booking.time}
                            </span>
                          </div>
                        </div>
                        <button className="ml-4 p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>

          {/* Section 3: Account Management */}
          <motion.section
            custom={3}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-2xl border border-destructive/20 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Gestione Account</h2>
            </div>

            <div className="p-6">
              <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
                L'eliminazione dell'account è un'azione <strong className="text-foreground">irreversibile</strong>. 
                Tutti i tuoi dati personali e le prenotazioni verranno eliminati permanentemente.
              </p>
              <motion.button
                onClick={() => setShowDeleteModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-destructive/30 text-destructive rounded-lg font-sans text-sm tracking-widest uppercase hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
              >
                <Trash2 size={15} />
                Elimina Account
              </motion.button>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-background rounded-2xl border border-border shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>

              <h3 className="font-serif text-xl text-foreground mb-2">Sei sicuro?</h3>
              <p className="font-sans text-sm text-muted-foreground mb-6 leading-relaxed">
                Questa azione è irreversibile. Il tuo account e tutti i dati associati verranno eliminati permanentemente.
              </p>

              <div className="flex gap-3">
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
                  disabled={deleting}
                  whileHover={!deleting ? { scale: 1.02 } : {}}
                  whileTap={!deleting ? { scale: 0.98 } : {}}
                  className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-lg font-sans text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-all duration-300"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
                  Elimina
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </PageTransition>
  );
};

export default Profilo;
