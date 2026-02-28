import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-ocean.jpg";

const headlines = [
  "Il tuo appartamento esclusivo\nvista oceano a Boa Vista.",
  "Svegliati davanti\nall'Atlantico.",
  "Vista mare. Privacy totale.\nComfort assoluto.",
  "Non un hotel.\nIl tuo spazio sull'oceano.",
];

const HeroSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % headlines.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Fixed-height container for headline to prevent layout shift */}
        <div className="h-[180px] md:h-[220px] lg:h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-tight whitespace-pre-line drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
              style={{ color: "white", textShadow: "0 2px 30px rgba(0,0,0,0.6)" }}
            >
              {headlines[index]}
            </motion.h1>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed tracking-wide drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)]"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          Appartamenti vista mare nelle esclusive Praia Cabral e Praia da Cruz.
          Indipendenza totale, comfort di alto livello e accesso a servizi premium
          riservati ai nostri ospiti.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/contatti">
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block font-sans text-xs tracking-[0.2em] uppercase px-8 py-4 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: "white",
                color: "#1a1a1a",
              }}
            >
              Verifica Disponibilità
            </motion.span>
          </Link>
          <Link to="/appartamenti">
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block font-sans text-xs tracking-[0.2em] uppercase px-8 py-4 border transition-all duration-300 backdrop-blur-sm"
              style={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              Scopri gli Appartamenti
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-12" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
