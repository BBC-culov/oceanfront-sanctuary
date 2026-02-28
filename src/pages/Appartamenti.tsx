import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ApartmentsSection from "@/components/sections/ApartmentsSection";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImg from "@/assets/hero-appartamenti.jpg";

const Appartamenti = () => {
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
          className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden"
        >
          <motion.div
            className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${heroImg})`, y: heroY }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--hero-overlay-from)/0.7)] via-transparent to-[hsl(var(--hero-overlay-to)/0.3)]" />
          <div className="relative z-10 px-6 lg:px-8 pb-12 mx-auto max-w-7xl w-full">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(var(--hero-text-muted))] mb-3"
            >
              Le Residenze
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl font-light text-[hsl(var(--hero-text))]"
            >
              I Nostri Appartamenti
            </motion.h1>
          </div>
        </section>

        <ApartmentsSection />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Appartamenti;
