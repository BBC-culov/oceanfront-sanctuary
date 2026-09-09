import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

interface RegistrationSuccessPanelProps {
  email: string;
  onGoToLogin: () => void;
  onGoHome: () => void;
}

const RegistrationSuccessPanel = ({ email, onGoToLogin, onGoHome }: RegistrationSuccessPanelProps) => (
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
      <Mail className="w-10 h-10 text-primary" />
    </motion.div>

    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="font-serif text-2xl text-foreground mb-3"
    >
      Controlla la tua email
    </motion.h2>

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="text-muted-foreground text-sm font-sans mb-2 leading-relaxed"
    >
      Abbiamo inviato un link di conferma a
    </motion.p>

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="text-foreground font-medium text-sm font-sans mb-6"
    >
      {email}
    </motion.p>

    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="text-muted-foreground text-xs font-sans mb-8 leading-relaxed"
    >
      Clicca sul link nell'email per attivare il tuo account.<br />
      Se non trovi l'email, controlla la cartella spam.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex flex-col gap-3"
    >
      <button
        onClick={onGoToLogin}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:bg-primary/90"
      >
        <ArrowRight size={16} />
        Vai al Login
      </button>
      <button
        onClick={onGoHome}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
      >
        Torna alla home
      </button>
    </motion.div>
  </motion.div>
);

export default RegistrationSuccessPanel;
