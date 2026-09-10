import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Loader2, Mail, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import { useProfiloData } from "@/hooks/useProfiloData";
import ProfileInfoSection from "@/components/profilo/ProfileInfoSection";
import ProfiloBookingsSection from "@/components/profilo/ProfiloBookingsSection";
import {
  AccountManagementSection,
  AssistanceSection,
  DataExportSection,
} from "@/components/profilo/ProfiloAccountSections";
import DeleteAccountModal from "@/components/profilo/DeleteAccountModal";

const Profilo = () => {
  const location = useLocation();
  const bookingsRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    navigate,
    loading, saving, deleting,
    saveMessage, errors,
    userEmail, form, setForm,
    bookings, bookingsLoading,
    handleSave, deleteAccount, exportData,
  } = useProfiloData();

  // Scroll to bookings section if hash is #prenotazioni
  useEffect(() => {
    if (location.hash === "#prenotazioni" && bookingsRef.current && !loading) {
      setTimeout(() => {
        bookingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }
  }, [location.hash, loading]);

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
      <Seo
        noindex
        title="Area riservata | BAZHOUSE"
        description="Gestisci il tuo profilo BAZHOUSE: prenotazioni, saldi, dati personali e preferenze account."
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header with avatar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="text-center mb-4"
          >
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

          <ProfileInfoSection
            userEmail={userEmail}
            form={form}
            setForm={setForm}
            errors={errors}
            saving={saving}
            saveMessage={saveMessage}
            onSave={handleSave}
          />

          <div ref={bookingsRef}>
            <ProfiloBookingsSection bookings={bookings} loading={bookingsLoading} />
          </div>

          <DataExportSection onExport={exportData} />

          <AccountManagementSection
            onUpdatePassword={() => navigate("/registrati", { state: { forgotPassword: true } })}
            onDeleteRequest={() => setShowDeleteModal(true)}
          />

          <AssistanceSection onContact={() => navigate("/contatti")} />
        </div>
      </main>

      <DeleteAccountModal
        open={showDeleteModal}
        deleting={deleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAccount}
      />

      <Footer />
    </PageTransition>
  );
};

export default Profilo;
