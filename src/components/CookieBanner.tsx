import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "bazhouse_cookie_consent";

type ConsentValue = "accepted" | "rejected" | null;

const CookieBanner = () => {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1500);
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
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6"
      >
        <div className="max-w-2xl mx-auto bg-card border border-border/60 rounded-2xl shadow-2xl p-5 sm:p-6 relative">
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-base text-foreground mb-1">Utilizziamo i cookie</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Questo sito utilizza cookie tecnici necessari al funzionamento. Non utilizziamo cookie di profilazione o di terze parti per scopi pubblicitari.{" "}
                <Link to="/privacy" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <motion.button
              onClick={() => handleConsent("rejected")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 border border-border rounded-lg font-sans text-sm text-foreground hover:bg-muted transition-all duration-300"
            >
              Rifiuta
            </motion.button>
            <motion.button
              onClick={() => handleConsent("accepted")}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm transition-all duration-300"
            >
              Accetta
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;
