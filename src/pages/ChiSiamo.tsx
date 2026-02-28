import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import sunsetImg from "@/assets/boavista-sunset.jpg";
import aerialImg from "@/assets/boavista-aerial.jpg";

const values = [
  { num: "3", label: "Residenze esclusive" },
  { num: "5★", label: "Standard di qualità" },
  { num: "24/7", label: "Assistenza dedicata" },
  { num: "100%", label: "Soddisfazione ospiti" },
];

const ChiSiamo = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageTransition>
      <Navbar />
      <main>
        {/* Hero with parallax */}
        <section
          ref={heroRef}
          className="relative h-[55vh] min-h-[420px] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${sunsetImg})`, y: heroY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-overlay-from)/0.5)] to-[hsl(var(--hero-overlay-to)/0.7)]" />
          <div className="relative z-10 text-center px-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(var(--hero-text-muted))] mb-4"
            >
              La Nostra Storia
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl font-light text-[hsl(var(--hero-text))]"
            >
              Chi Siamo
            </motion.h1>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-primary">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {values.map((v, i) => (
                <motion.div
                  key={v.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-serif text-3xl md:text-4xl font-light text-primary-foreground">
                    {v.num}
                  </p>
                  <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-primary-foreground/70 mt-1">
                    {v.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Il Progetto */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-[1px] bg-primary mb-6"
                />
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                  Il Progetto
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">
                  Un progetto europeo con visione internazionale.
                </h2>
                <div className="font-sans text-base text-muted-foreground leading-relaxed space-y-6">
                  <p>
                    BAZHOUSE è un progetto sviluppato da EasyClick, azienda slovena,
                    attraverso la sua realtà operativa locale Rilab con sede a Boa
                    Vista. Non siamo un semplice servizio di affitto, ma un team che
                    investe sull'isola e costruisce relazioni di qualità.
                  </p>
                  <p>
                    Offriamo appartamenti di livello superiore, esperienza
                    personalizzata e servizi selezionati.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="overflow-hidden group"
              >
                <img
                  src={aerialImg}
                  alt="Boa Vista vista aerea"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Filosofia */}
        <section className="py-24 lg:py-32 bg-secondary">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-primary mx-auto mb-6"
              />
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                La Nostra Filosofia
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="font-serif text-2xl md:text-4xl font-light leading-relaxed italic"
              >
                "Indipendenza totale, comfort completo, privacy e accesso a
                servizi premium in posizione privilegiata fronte mare."
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">
                Vuoi saperne di più?
              </h2>
              <p className="font-sans text-sm text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Scopri i nostri appartamenti o contattaci per creare il tuo soggiorno su misura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/appartamenti">
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="inline-block font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors duration-300 shadow-md"
                  >
                    Gli Appartamenti
                  </motion.span>
                </a>
                <a href="/contatti">
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="inline-block font-sans text-xs tracking-[0.2em] uppercase border border-primary text-primary px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    Contattaci
                  </motion.span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ChiSiamo;
