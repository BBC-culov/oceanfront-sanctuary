import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Eye, EyeOff, KeyRound, Loader2, Trash2, X } from "lucide-react";

interface DeleteAccountModalProps {
  open: boolean;
  deleting: boolean;
  onClose: () => void;
  /** Returns an error message, or null when the deletion succeeded. */
  onConfirm: (password: string) => Promise<string | null>;
}

const DeleteAccountModal = ({ open, deleting, onClose, onConfirm }: DeleteAccountModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = async () => {
    setError("");
    const message = await onConfirm(password);
    if (message) setError(message);
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
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
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative bg-background rounded-2xl border border-border shadow-2xl p-8 max-w-sm w-full text-center"
          >
            <button
              onClick={handleClose}
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
              <motion.div animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ delay: 0.4, duration: 0.5 }}>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Inserisci la tua password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:border-destructive/50 focus:ring-2 focus:ring-destructive/20 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-sans"
                  >
                    <AlertCircle size={12} />
                    {error}
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
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 border border-border rounded-lg font-sans text-sm text-foreground hover:bg-muted transition-all duration-300"
              >
                Annulla
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                disabled={deleting || !password.trim()}
                whileHover={!deleting && password.trim() ? { scale: 1.02 } : {}}
                whileTap={!deleting && password.trim() ? { scale: 0.98 } : {}}
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
  );
};

export default DeleteAccountModal;
