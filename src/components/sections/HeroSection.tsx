import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-ocean.jpg";

const headlines = [
  "Il tuo appartamento esclusivo vista oceano a Boa Vista.",
  "Svegliati davanti all'Atlantico.",
  "Vista mare. Privacy totale. Comfort assoluto.",
  "Non un hotel. Il tuo spazio sull'oceano.",
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
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground leading-tight"
          >
            {headlines[index]}
          </motion.h1>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 font-sans text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed tracking-wide"
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
          <Link
            to="/contatti"
            className="font-sans text-xs tracking-[0.2em] uppercase bg-primary-foreground text-foreground px-8 py-4 hover:bg-accent transition-colors duration-300"
          >
            Verifica Disponibilità
          </Link>
          <Link
            to="/appartamenti"
            className="font-sans text-xs tracking-[0.2em] uppercase border border-primary-foreground/60 text-primary-foreground px-8 py-4 hover:bg-primary-foreground/10 transition-colors duration-300"
          >
            Scopri gli Appartamenti
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-12 bg-primary-foreground/40" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
