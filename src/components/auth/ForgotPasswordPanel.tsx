import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { INPUT_CLASS } from "./authMotion";
import type { GlobalMessage } from "@/hooks/useAuthForms";

interface ForgotPasswordPanelProps {
  email: string;
  setEmail: (value: string) => void;
  sent: boolean;
  loading: boolean;
  globalMessage: GlobalMessage;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const ForgotPasswordPanel = ({
  email, setEmail, sent, loading, globalMessage, onSubmit, onBack,
}: ForgotPasswordPanelProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    className="px-8 py-12 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
    >
      {sent ? <Mail className="w-10 h-10 text-primary" /> : <Lock className="w-10 h-10 text-primary" />}
    </motion.div>

    {sent ? (
      <>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-serif text-2xl text-foreground mb-3">
          Email inviata!
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-sm font-sans mb-2 leading-relaxed">
          Abbiamo inviato un link per reimpostare la password a
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-foreground font-medium text-sm font-sans mb-6">
          {email}
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-muted-foreground text-xs font-sans mb-8 leading-relaxed">
          Clicca sul link nell'email per impostare una nuova password.<br />
          Se non trovi l'email, controlla la cartella spam.
        </motion.p>
      </>
    ) : (
      <>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-serif text-2xl text-foreground mb-3">
          Password dimenticata?
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-sm font-sans mb-6 leading-relaxed">
          Inserisci la tua email e ti invieremo un link per reimpostare la password.
        </motion.p>

        <AnimatePresence>
          {globalMessage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-sans ${globalMessage.type === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <AlertCircle size={16} />
                {globalMessage.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onSubmit={onSubmit}
          className="space-y-4 text-left"
        >
          <div>
            <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tuaemail@esempio.com"
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Invia link<ArrowRight size={16} /></>}
          </motion.button>
        </motion.form>
      </>
    )}

    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      onClick={onBack}
      className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
    >
      ← Torna al login
    </motion.button>
  </motion.div>
);

export default ForgotPasswordPanel;
