import { motion } from "framer-motion";
import boavistaImg from "@/assets/boavista-aerial.jpg";

const BoaVistaSection = () => (
  <section className="relative py-32 lg:py-48 overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${boavistaImg})` }}
    >
      <div className="absolute inset-0 bg-foreground/50" />
    </div>

    <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-primary-foreground/70 mb-4">
          Boa Vista
        </p>
        <h2 className="font-serif text-4xl md:text-6xl font-light text-primary-foreground leading-tight mb-8">
          Un'isola che non si visita.
          <br />
          Si vive.
        </h2>
        <p className="font-sans text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
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

export default BoaVistaSection;
