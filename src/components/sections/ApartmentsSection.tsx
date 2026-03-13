import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, BedDouble, Maximize, CalendarCheck } from "lucide-react";
import { useRef } from "react";
import { useApartments, type ApartmentPublic } from "@/hooks/useApartments";
import staticApartments from "@/data/apartments";

const FlowingLine = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);

  const particles = [
    { x: "10%", y: "55%", size: 3, delay: 0 },
    { x: "20%", y: "30%", size: 4, delay: 0.3 },
    { x: "30%", y: "45%", size: 2.5, delay: 0.1 },
    { x: "40%", y: "25%", size: 3.5, delay: 0.5 },
    { x: "50%", y: "50%", size: 3, delay: 0.2 },
    { x: "60%", y: "70%", size: 4, delay: 0.4 },
    { x: "70%", y: "45%", size: 2.5, delay: 0.6 },
    { x: "80%", y: "30%", size: 3, delay: 0.15 },
    { x: "90%", y: "55%", size: 3.5, delay: 0.35 },
  ];

  return (
    <div ref={ref} className="relative h-40 md:h-52 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 1200 120" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" fill="none">
        <motion.path d="M 0 60 C 150 20, 300 100, 450 60 C 600 20, 750 100, 900 60 C 1050 20, 1150 80, 1200 60" stroke="hsl(var(--primary) / 0.08)" strokeWidth="30" strokeLinecap="round" fill="none" style={{ pathLength, opacity }} />
        <motion.path d="M 0 60 C 150 20, 300 100, 450 60 C 600 20, 750 100, 900 60 C 1050 20, 1150 80, 1200 60" stroke="hsl(var(--primary) / 0.3)" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pathLength, opacity }} />
        <motion.path d="M 0 55 C 200 95, 350 15, 600 55 C 850 95, 1000 15, 1200 55" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="6 10" style={{ pathLength, opacity }} />
        <motion.path d="M 0 65 C 100 35, 250 85, 400 65 C 550 45, 700 85, 850 65 C 1000 45, 1100 75, 1200 65" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" strokeLinecap="round" fill="none" style={{ pathLength, opacity }} />
      </svg>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/30"
          style={{ left: p.x, top: p.y, width: p.size * 2, height: p.size * 2, opacity }}
          initial={{ scale: 0, y: 0 }}
          whileInView={{ scale: [0, 1.4, 0.8, 1], y: [0, -8, 4, 0] }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, delay: p.delay, repeat: Infinity, repeatType: "reverse" as const, repeatDelay: 2 + i * 0.3 }}
        />
      ))}
      <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity }} initial={{ scale: 0, rotate: 45 }} whileInView={{ scale: [0, 1.2, 1], rotate: 45 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}>
        <div className="w-3 h-3 bg-primary/20 border border-primary/30" />
      </motion.div>
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const ApartmentsSection = () => {
  const { data: dbApartments, isLoading } = useApartments();

  // Use DB data if available, otherwise fall back to static
  const apartments = dbApartments && dbApartments.length > 0 ? dbApartments : staticApartments;

  const residences = apartments.filter((a) => a.category === "residence");
  const penthouse = apartments.find((a) => a.category === "penthouse");
  const compact = apartments.find((a) => a.category === "compact");

  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Gli Appartamenti</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Eleganza fronte mare.</h2>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            Otto residenze esclusive, ognuna con la propria personalità. Scopri quella perfetta per la tua esperienza a Boa Vista.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {residences.map((apt, i) => (
            <motion.div key={apt.slug} custom={i} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <ApartmentCard apt={apt} />
            </motion.div>
          ))}
        </div>

        <FlowingLine />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {penthouse && (
            <motion.div className="lg:col-span-3" custom={0} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <ApartmentCard apt={penthouse} featured />
            </motion.div>
          )}
          {compact && (
            <motion.div className="lg:col-span-2" custom={1} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
              <ApartmentCard apt={compact} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

interface ApartmentCardProps {
  apt: ApartmentPublic | (typeof staticApartments)[number];
  featured?: boolean;
}

const ApartmentCard = ({ apt, featured }: ApartmentCardProps) => (
  <Link to={`/appartamenti/${apt.slug}`} className="group block bg-background overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full">
    <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
      {apt.cover ? (
        <img src={apt.cover} alt={apt.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Nessuna immagine</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-out">
        <CalendarCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
        <span className="font-sans text-xs tracking-[0.15em] uppercase text-foreground">Verifica Disponibilità</span>
        <ArrowRight className="w-3.5 h-3.5 text-foreground" />
      </div>
    </div>
    <div className="p-6">
      <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">{apt.tagline}</p>
      <h3 className="font-serif text-2xl font-light mb-4 text-foreground group-hover:text-primary transition-colors duration-300">{apt.name}</h3>
      <div className="flex items-center gap-5 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-sans text-xs">{apt.guests} ospiti</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BedDouble className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-sans text-xs">{apt.bedrooms} {apt.bedrooms > 1 ? "camere" : "camera"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Maximize className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-sans text-xs">{apt.sqm} m²</span>
        </div>
      </div>
      <div className="mt-5 h-px bg-primary/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </div>
  </Link>
);

export default ApartmentsSection;
