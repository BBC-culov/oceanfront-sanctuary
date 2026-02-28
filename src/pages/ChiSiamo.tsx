import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import sunsetImg from "@/assets/boavista-sunset.jpg";

const ChiSiamo = () => (
  <>
    <Navbar />
    <main>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sunsetImg})` }}>
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl font-light text-primary-foreground"
          >
            Chi Siamo
          </motion.h1>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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

            <div className="mt-16 border-t border-border pt-12">
              <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                La Nostra Filosofia
              </p>
              <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed italic">
                Indipendenza totale, comfort completo, privacy e accesso a
                servizi premium in posizione privilegiata fronte mare.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default ChiSiamo;
