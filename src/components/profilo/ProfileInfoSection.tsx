import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Edit3, Loader2, Mail, Save } from "lucide-react";
import PhonePrefixInput from "@/components/PhonePrefixInput";
import { AnimatedInput, AnimatedSection } from "./ProfiloUi";

interface ProfileInfoSectionProps {
  userEmail: string;
  form: { firstName: string; lastName: string; phone: string };
  setForm: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; phone: string }>>;
  errors: Record<string, string>;
  saving: boolean;
  saveMessage: { type: "success" | "error"; text: string } | null;
  onSave: () => void;
}

const ProfileInfoSection = ({
  userEmail, form, setForm, errors, saving, saveMessage, onSave,
}: ProfileInfoSectionProps) => (
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

      <motion.div
        className="flex flex-wrap items-center gap-4 pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.button
          onClick={onSave}
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
);

export default ProfileInfoSection;
