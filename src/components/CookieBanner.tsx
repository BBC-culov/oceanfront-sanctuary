import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "bazhouse_cookie_consent";

type ConsentValue = "accepted" | "rejected" | null;

const CookieBanner = () => {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    setConsent(stored as ConsentValue);
  }, []);

  const handleConsent = (value: "accepted" | "rejected") => {
    localStorage.setItem(COOKIE_KEY, value);
    setConsent(value);
    setVisible(false);
  };

  if (consent || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -20, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="fixed bottom-5 left-5 z-[60] w-[340px]"
        >
          <div className="bg-card border border-border/50 rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="w-4 h-4 text-primary" />
              </div>
              <p className="font-serif text-sm text-foreground font-medium">Cookie</p>
            </div>

            <p className="font-sans text-xs text-muted-foreground leading-relaxed mb-3">
              Utilizziamo solo cookie tecnici necessari. Nessun tracciamento.{" "}
              <Link to="/privacy" className="text-primary hover:underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>

            <div className="flex gap-2">
              <motion.button
                onClick={() => handleConsent("rejected")}
                whileTap={{ scale: 0.97 }}
                className="flex-1 px-3 py-2 border border-border rounded-lg font-sans text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Rifiuta
              </motion.button>
              <motion.button
                onClick={() => handleConsent("accepted")}
                whileTap={{ scale: 0.97 }}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg font-sans text-xs font-medium transition-colors"
              >
                Accetta
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
