import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Home,
  Eye,
  MapPin,
  PlaneTakeoff,
  Sparkles,
  ShoppingCart,
  Bike,
  CalendarCheck,
  Compass,
  Waves,
  Headset,
  UtensilsCrossed,
  ShieldCheck,
  Car,
  Shirt,
  Dumbbell,
  Camera,
  type LucideIcon,
} from "lucide-react";
import heroImg from "@/assets/hero-servizi.jpg";

interface ServiceItem {
  icon: LucideIcon;
  label: string;
  desc: string;
}

interface ServiceCategory {
  tag: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
  accent?: boolean;
}

const categories: ServiceCategory[] = [
  {
    tag: "Inclusi nel soggiorno",
    title: "Tutto ciò che serve.",
    subtitle: "Ogni prenotazione include servizi pensati per un'esperienza senza pensieri.",
    items: [
      { icon: Home, label: "Appartamento arredato", desc: "Spazi eleganti e completamente equipaggiati per il massimo comfort." },
      { icon: Eye, label: "Vista mare", desc: "Affaccio diretto sull'oceano Atlantico da ogni residenza." },
      { icon: MapPin, label: "Posizione esclusiva", desc: "Zona residenziale tranquilla a pochi passi dalla spiaggia." },
      { icon: PlaneTakeoff, label: "Transfer aeroporto", desc: "Servizio navetta andata e ritorno incluso nel soggiorno." },
      { icon: ShieldCheck, label: "Assicurazione soggiorno", desc: "Copertura completa per un viaggio senza preoccupazioni." },
      { icon: UtensilsCrossed, label: "Kit benvenuto", desc: "Prodotti locali e tutto il necessario per il primo giorno." },
    ],
  },
  {
    tag: "Esperienze su richiesta",
    title: "Personalizza il tuo viaggio.",
    subtitle: "Servizi aggiuntivi per rendere ogni momento indimenticabile.",
    accent: true,
    items: [
      { icon: Sparkles, label: "Pulizia extra", desc: "Servizio di housekeeping su richiesta durante il soggiorno." },
      { icon: ShoppingCart, label: "Spesa a domicilio", desc: "Ordina online e ricevi la spesa direttamente in appartamento." },
      { icon: UtensilsCrossed, label: "Chef privato", desc: "Cena gourmet preparata a casa tua con prodotti locali." },
      { icon: Compass, label: "Tour dell'isola", desc: "Escursioni guidate alla scoperta di Boa Vista e dei suoi segreti." },
      { icon: Waves, label: "Sport acquatici", desc: "Surf, kitesurf, snorkeling e immersioni con istruttori qualificati." },
      { icon: Camera, label: "Servizio fotografico", desc: "Shooting professionale per ricordare la tua vacanza." },
    ],
  },
  {
    tag: "Mobilità & benessere",
    title: "Muoviti in libertà.",
    subtitle: "Esplora l'isola al tuo ritmo con i nostri servizi di mobilità e relax.",
    items: [
      { icon: Car, label: "Noleggio auto", desc: "Veicoli 4x4 e quad per esplorare ogni angolo dell'isola." },
      { icon: Bike, label: "Noleggio biciclette", desc: "E-bike e bici da spiaggia per scoprire la costa." },
      { icon: CalendarCheck, label: "Prenotazione attività", desc: "Organizziamo escursioni, ristoranti e transfer per te." },
      { icon: Headset, label: "Concierge 24/7", desc: "Assistenza personalizzata in italiano, inglese e portoghese." },
      { icon: Dumbbell, label: "Fitness & yoga", desc: "Sessioni private di yoga sulla spiaggia e accesso palestra." },
      { icon: Shirt, label: "Lavanderia", desc: "Servizio di lavaggio e stiratura con ritiro in giornata." },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const Servizi = () => {
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
          className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${heroImg})`, y: heroY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-overlay-from)/0.6)] to-[hsl(var(--hero-overlay-to)/0.7)]" />
          <div className="relative z-10 text-center px-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(var(--hero-text-muted))] mb-4"
            >
              I Nostri Servizi
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl font-light text-[hsl(var(--hero-text))]"
            >
              Un'ospitalità su misura.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="font-sans text-base text-[hsl(var(--hero-text-muted))] max-w-xl mx-auto mt-5 leading-relaxed"
            >
              Ogni dettaglio è pensato per offrirti un soggiorno impeccabile.
            </motion.p>
          </div>
        </section>

        {/* Categories */}
        {categories.map((cat, ci) => (
          <section
            key={ci}
            className={`py-20 lg:py-28 ${cat.accent ? "bg-secondary" : ""}`}
          >
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mb-14"
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-[1px] bg-primary mb-6"
                />
                <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-3">
                  {cat.tag}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-light mb-3">
                  {cat.title}
                </h2>
                <p className="font-sans text-sm text-muted-foreground max-w-xl leading-relaxed">
                  {cat.subtitle}
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      variants={cardVariants}
                      whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                      className={`group p-6 border border-border ${
                        cat.accent
                          ? "bg-background hover:shadow-lg"
                          : "bg-card hover:shadow-lg"
                      } transition-all duration-500`}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ rotate: 8 }}
                      >
                        <Icon
                          className="w-5 h-5 text-primary"
                          strokeWidth={1.5}
                        />
                      </motion.div>
                      <h3 className="font-sans text-sm font-medium mb-1.5 text-foreground">
                        {item.label}
                      </h3>
                      <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
        ))}

        {/* CTA with background */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-primary mx-auto mb-8"
              />
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">
                Hai bisogno di qualcosa in più?
              </h2>
              <p className="font-sans text-sm text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                Contattaci per qualsiasi richiesta speciale. Il nostro team è a
                tua disposizione per creare il soggiorno perfetto.
              </p>
              <a href="/contatti">
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="inline-block font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-10 py-4 hover:bg-primary/90 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Contattaci
                </motion.span>
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Servizi;
