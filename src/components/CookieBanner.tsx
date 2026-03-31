import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield, X } from "lucide-react";
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
          initial={{ y: 120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 180, mass: 0.8 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-[60]"
        >
          <div className="max-w-xl mx-auto relative overflow-hidden">
            {/* Glassmorphism card */}
            <div className="relative bg-card/95 backdrop-blur-2xl border border-border/40 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] p-5 sm:p-6">
              {/* Decorative gradient line */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-ocean to-accent rounded-t-2xl"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />

              {/* Close button */}
              <motion.button
                onClick={() => setVisible(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <X size={14} />
              </motion.button>

              <div className="flex items-start gap-4 mb-5">
                {/* Animated cookie icon */}
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-ocean/10 flex items-center justify-center shrink-0 border border-primary/10"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                  >
                    <Cookie className="w-5 h-5 text-primary" />
                  </motion.div>
                </motion.div>

                <div className="pr-6">
                  <motion.h3
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-serif text-base text-foreground mb-1.5"
                  >
                    La tua privacy conta
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="font-sans text-sm text-muted-foreground leading-relaxed"
                  >
                    Utilizziamo solo cookie tecnici necessari al funzionamento del sito. Nessun tracciamento pubblicitario.{" "}
                    <Link to="/privacy" className="text-primary font-medium hover:underline underline-offset-2 transition-all">
                      Scopri di più
                    </Link>
                  </motion.p>
                </div>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 justify-end"
              >
                <motion.button
                  onClick={() => handleConsent("rejected")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 border border-border rounded-xl font-sans text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
                >
                  Solo necessari
                </motion.button>
                <motion.button
                  onClick={() => handleConsent("accepted")}
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-sans text-sm font-medium flex items-center gap-2 transition-all duration-300 shadow-md shadow-primary/20"
                >
                  <Shield size={14} />
                  Accetta tutto
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
