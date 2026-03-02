import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import heroImg from "@/assets/hero-servizi.jpg";
import imgAppartamento from "@/assets/servizi-appartamento.jpg";
import imgComfort from "@/assets/servizi-comfort.jpg";
import imgVistaMare from "@/assets/servizi-vista-mare.jpg";
import imgSpiaggia from "@/assets/servizi-spiaggia.jpg";
import imgWelcome from "@/assets/servizi-welcome.jpg";
import TransferMap from "@/components/sections/TransferMap";

/* ------------------------------------------------------------------ */
/*  Data for the editorial "Inclusi" section                          */
/* ------------------------------------------------------------------ */
interface EditorialService {
  tag: string;
  title: string;
  description: string;
  image?: string;
  mapComponent?: boolean;
  reverse?: boolean;
}

const editorialServices: EditorialService[] = [
  {
    tag: "Residenza",
    title: "Appartamento arredato con cura.",
    description:
      "Spazi eleganti e completamente equipaggiati, dove ogni dettaglio è scelto per trasmettere calore e raffinatezza. Materiali naturali, luce morbida e l'essenza di Capo Verde in ogni angolo.",
    image: imgAppartamento,
  },
  {
    tag: "Comfort",
    title: "Il massimo comfort, ogni notte.",
    description:
      "Letti king-size con biancheria in cotone egiziano, cuscini memory e l'atmosfera perfetta per un riposo profondo. Svegliarsi qui è già vacanza.",
    image: imgComfort,
    reverse: true,
  },
  {
    tag: "Panorama",
    title: "Vista mare, senza compromessi.",
    description:
      "Ogni residenza BAZHOUSE offre un affaccio diretto sull'Atlantico. Un orizzonte sconfinato che accompagna le tue giornate, dalla colazione al tramonto.",
    image: imgVistaMare,
  },
  {
    tag: "Spiaggia",
    title: "A pochi passi dal paradiso.",
    description:
      "Sabbia bianca, acqua cristallina e il suono delle onde come unica colonna sonora. La spiaggia è il tuo giardino privato, raggiungibile in pochi minuti.",
    image: imgSpiaggia,
    reverse: true,
  },
  {
    tag: "Transfer",
    title: "Dall'aeroporto a casa tua.",
    description:
      "Il tuo viaggio inizia appena atterri. Un transfer privato ti porta direttamente al tuo appartamento BAZHOUSE, senza stress e senza attese.",
    mapComponent: true,
  },
  {
    tag: "Benvenuto",
    title: "Un benvenuto che sa di Capo Verde.",
    description:
      "Ad accoglierti trovi un kit con prodotti locali selezionati, frutta fresca e tutto il necessario per il primo giorno. Perché ogni arrivo merita un'emozione.",
    image: imgWelcome,
    reverse: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Data for "Su richiesta" & "Mobilità" grids (kept compact)         */
/* ------------------------------------------------------------------ */
interface ServiceCategory {
  tag: string;
  title: string;
  subtitle: string;
  items: { icon: LucideIcon; label: string; desc: string; hoverAnim?: Record<string, any> }[];
  accent?: boolean;
}

const extraCategories: ServiceCategory[] = [
  {
    tag: "Casa & comfort",
    title: "Il tuo appartamento, ancora più su misura.",
    subtitle: "Servizi domestici per vivere ogni giorno senza pensieri.",
    accent: true,
    items: [
      { icon: ShieldCheck, label: "Pulizia extra", desc: "Servizio di housekeeping aggiuntivo su richiesta durante il soggiorno.", hoverAnim: { rotate: [0, -10, 10, -5, 0] } },
      { icon: ShieldCheck, label: "Consegna a domicilio", desc: "Servizio espresso di spesa e consegna direttamente in appartamento.", hoverAnim: { x: [0, 6, 0] } },
    ],
  },
  {
    tag: "Mobilità & avventura",
    title: "Esplora l'isola in libertà.",
    subtitle: "Noleggia il mezzo perfetto per le tue giornate a Boa Vista.",
    items: [
      { icon: ShieldCheck, label: "Noleggio biciclette", desc: "Bici a disposizione per esplorare l'isola al tuo ritmo.", hoverAnim: { rotate: [0, 15, -15, 0] } },
      { icon: ShieldCheck, label: "Noleggio quad", desc: "Quad per avventurarti nei percorsi off-road di Boa Vista.", hoverAnim: { y: [0, -4, 2, -2, 0] } },
      { icon: ShieldCheck, label: "Noleggio auto", desc: "Veicoli per muoverti in totale libertà sull'isola.", hoverAnim: { x: [0, 5, 0] } },
      { icon: ShieldCheck, label: "Noleggio moto", desc: "Moto per esplorare ogni angolo di Boa Vista con agilità.", hoverAnim: { rotate: [0, -8, 8, 0], y: [0, -2, 0] } },
    ],
  },
  {
    tag: "Benessere & assistenza",
    title: "Prenditi cura di te.",
    subtitle: "Relax e supporto personalizzato per un'esperienza completa.",
    accent: true,
    items: [
      { icon: ShieldCheck, label: "Massaggi & SPA", desc: "Prenota sessioni di massaggio e trattamenti SPA sull'isola.", hoverAnim: { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } },
      { icon: ShieldCheck, label: "Trattamenti beauty", desc: "Centro estetico e trattamenti di bellezza su prenotazione.", hoverAnim: { rotate: [0, 20, 0] } },
      { icon: ShieldCheck, label: "Concierge 24/7", desc: "Assistenza personalizzata in italiano, inglese e portoghese.", hoverAnim: { y: [0, -3, 0, -2, 0] } },
      { icon: ShieldCheck, label: "Prenotazione attività", desc: "Organizziamo escursioni, ristoranti e transfer per te.", hoverAnim: { scale: [1, 1.1, 1] } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */
import {
  Sparkles,
  Truck,
  Bike,
  Car,
  CalendarCheck,
  Headset,
  Flower2,
  Scissors,
  Zap,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "Pulizia extra": Sparkles,
  "Consegna a domicilio": Truck,
  "Noleggio biciclette": Bike,
  "Noleggio quad": Zap,
  "Noleggio auto": Car,
  "Noleggio moto": Car,
  "Massaggi & SPA": Flower2,
  "Trattamenti beauty": Scissors,
  "Concierge 24/7": Headset,
  "Prenotazione attività": CalendarCheck,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
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
        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative h-[60vh] min-h-[440px] flex items-center justify-center overflow-hidden"
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

        {/* ── Section tag: Inclusi ── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-16 text-center max-w-2xl mx-auto"
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-primary mx-auto mb-6"
              />
              <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-3">
                Inclusi nel soggiorno
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-light">
                Tutto ciò che serve per sognare.
              </h2>
            </motion.div>
          </div>
        </section>

        {/* ── Editorial service blocks ── */}
        {editorialServices.map((service, i) => (
          <section
            key={i}
            className={`${i % 2 === 0 ? "" : "bg-secondary"}`}
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 min-h-[480px] ${
                  service.reverse ? "lg:direction-rtl" : ""
                }`}
              >
                {/* Image / Map */}
                <motion.div
                  initial={{ opacity: 0, x: service.reverse ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`relative overflow-hidden ${
                    service.reverse ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  {service.mapComponent ? (
                    <div className="flex items-center justify-center h-full p-8 lg:p-12 bg-muted/30">
                      <TransferMap />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                      style={{ backgroundImage: `url(${service.image})` }}
                    />
                  )}
                  {/* Minimum height for mobile */}
                  {!service.mapComponent && <div className="pt-[70%] lg:pt-0" />}
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className={`flex flex-col justify-center px-8 py-14 lg:px-16 lg:py-20 ${
                    service.reverse ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-4">
                    {service.tag}
                  </p>
                  <h3 className="font-serif text-2xl md:text-4xl font-light leading-tight mb-5">
                    {service.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-md">
                    {service.description}
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        ))}

        {/* ── Extra service grids ── */}
        {extraCategories.map((cat, ci) => (
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
                  const Icon = iconMap[item.label] || ShieldCheck;
                  const hoverAnim = item.hoverAnim || { rotate: 8 };
                  return (
                    <motion.div
                      key={item.label}
                      variants={cardVariants}
                      whileHover={{
                        y: -6,
                        transition: { type: "spring", stiffness: 400, damping: 25 },
                      }}
                      className={`group p-6 border border-border ${
                        cat.accent
                          ? "bg-background hover:shadow-lg"
                          : "bg-card hover:shadow-lg"
                      } transition-all duration-500`}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ ...hoverAnim, transition: { duration: 0.5, ease: "easeInOut" } }}
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

        {/* ── CTA ── */}
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
