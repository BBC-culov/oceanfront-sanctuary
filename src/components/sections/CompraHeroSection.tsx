import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-ocean.jpg";

const CompraHeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleScroll = () => {
    document.getElementById("progetti")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${heroImage})`, y: bgY }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/45 to-primary/65" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-sans text-xs tracking-[0.3em] uppercase text-hero-text-muted mb-6"
        >
          Investimento immobiliare
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-tight text-hero-text drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
        >
          Investi a Boa Vista.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 font-sans text-sm md:text-base max-w-2xl mx-auto leading-relaxed tracking-wide text-hero-text-muted drop-shadow-[0_1px_8px_rgba(0,0,0,0.3)]"
        >
          Progetti immobiliari selezionati, costruiti con la stessa cura con cui ospitiamo.
          Rendita, lifestyle e una casa al mare che lavora per te.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10"
        >
          <motion.button
            onClick={handleScroll}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block font-sans text-xs tracking-[0.2em] uppercase px-8 py-4 border border-hero-cta-border/50 text-hero-text backdrop-blur-sm bg-hero-text/5 transition-all duration-300 hover:bg-hero-text/10"
          >
            Scopri i Progetti
          </motion.button>
        </motion.div>
      </div>

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

export default CompraHeroSection;
