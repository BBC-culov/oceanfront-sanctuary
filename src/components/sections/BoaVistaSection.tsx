import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import boavistaImg from "@/assets/boavista-aerial.jpg";

const BoaVistaSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative py-32 lg:py-48 overflow-hidden">
      <motion.div
        className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${boavistaImg})`, y }}
      >
        <div className="absolute inset-0 bg-primary/55" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-hero-text-muted mb-4">
            Boa Vista
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-light text-hero-text leading-tight mb-8">
            Un'isola che non si visita.
            <br />
            Si vive.
          </h2>
          <p className="font-sans text-base md:text-lg text-hero-text-muted max-w-2xl mx-auto leading-relaxed">
            Spiagge infinite, sabbia dorata, oceano cristallino, tramonti
            spettacolari e ritmo rilassato. Praia Cabral e Praia da Cruz sono zone
            esclusive, residenziali ed eleganti affacciate direttamente
            sull'Atlantico. Scegliere BAZHOUSE significa vivere l'isola con un
            punto di vista privilegiato.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BoaVistaSection;
