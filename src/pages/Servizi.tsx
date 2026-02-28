import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
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

const Servizi = () => (
  <PageTransition>
    <Navbar />
    <main>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              I Nostri Servizi
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-light mb-5">
              Un'ospitalità su misura.
            </h1>
            <p className="font-sans text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ogni dettaglio è pensato per offrirti un soggiorno impeccabile.
              Dai servizi inclusi alle esperienze personalizzate, ci prendiamo
              cura di tutto noi.
            </p>
          </motion.div>
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
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`group p-6 border border-border ${
                      cat.accent
                        ? "bg-background hover:shadow-lg"
                        : "bg-card hover:shadow-lg"
                    } transition-shadow duration-500`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon
                        className="w-5 h-5 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
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

export default Servizi;
