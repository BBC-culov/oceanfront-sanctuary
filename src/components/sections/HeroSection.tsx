import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-ocean.jpg";

const headlines = [
  "Acquista in un luogo straordinario. Trasforma la tua casa in un patrimonio.",
  "Residenze esclusive, pensate per essere vissute e valorizzate nel tempo.",
  "Più di una casa sul mare. Un patrimonio che può lavorare anche quando non ci sei.",
  "Location straordinarie. Case esclusive. Opportunità di valorizzazione.",
  "Acquista una casa. Costruisci una rendita potenziale. Vivi entrambe.",
];


const HeroSection = () => {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % headlines.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${heroImage})`, y: bgY }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/45 to-primary/65" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Fixed-height container for headline to prevent layout shift */}
        <div className="min-h-[200px] md:min-h-[220px] lg:min-h-[240px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl font-light leading-[1.15] text-balance text-hero-text drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
            >
              {headlines[index]}
            </motion.h1>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed tracking-wide text-hero-text-muted drop-shadow-[0_1px_8px_rgba(0,0,0,0.3)]"
        >
          BazHouse seleziona, realizza e valorizza immobili in destinazioni straordinarie, accompagnando ogni cliente con l'affidabilità di una società europea e la presenza concreta di un partner locale.

        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/appartamenti">
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block font-sans text-xs tracking-[0.2em] uppercase px-8 py-4 border border-hero-cta-border/50 text-hero-text backdrop-blur-sm bg-hero-text/5 transition-all duration-300 hover:bg-hero-text/10"
            >
              Voglio Affittare
            </motion.span>
          </Link>
          <Link to="/compra">
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block font-sans text-xs tracking-[0.2em] uppercase px-8 py-4 border border-hero-cta-border/50 text-hero-text backdrop-blur-sm bg-hero-text/5 transition-all duration-300 hover:bg-hero-text/10"
            >
              Voglio Comprare
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
        <div className="w-px h-12 bg-hero-text/40" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
