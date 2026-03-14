import { motion } from "framer-motion";
import { Wrench, RefreshCw, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const MaintenancePage = ({ message }: { message: string }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -50, 0], scale: [1, 0.8, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-ocean/5 blur-3xl"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* Animated icon */}
        <motion.div
          className="mx-auto mb-8 relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Wrench className="w-10 h-10 text-primary" />
            </motion.div>
          </motion.div>
          {/* Orbiting elements */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ width: 120, height: 120, top: -12, left: "calc(50% - 60px)" }}
          >
            <motion.div className="absolute top-0 left-1/2 -translate-x-1/2">
              <RefreshCw className="w-4 h-4 text-accent-foreground/40" />
            </motion.div>
          </motion.div>
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ width: 150, height: 150, top: -27, left: "calc(50% - 75px)" }}
          >
            <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <Clock className="w-3 h-3 text-muted-foreground/40" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1
          className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Manutenzione in corso
        </motion.h1>

        <motion.p
          className="font-sans text-base text-muted-foreground leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {message}
        </motion.p>

        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-accent"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="font-sans text-sm text-muted-foreground">
            Lavori in corso{dots}
          </span>
        </motion.div>

        <motion.p
          className="font-sans text-xs text-muted-foreground/50 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          BAZHOUSE — Torneremo presto
        </motion.p>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
