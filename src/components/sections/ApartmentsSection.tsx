import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, BedDouble, Maximize, CalendarCheck } from "lucide-react";
import { useRef } from "react";
import apartments from "@/data/apartments";

const FlowingLine = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 800 100"
        className="w-full max-w-3xl h-full"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M 0 50 Q 200 10, 400 50 Q 600 90, 800 50"
          stroke="hsl(var(--primary) / 0.25)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          style={{ pathLength, opacity }}
        />
        <motion.path
          d="M 0 50 Q 200 10, 400 50 Q 600 90, 800 50"
          stroke="hsl(var(--primary) / 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="4 8"
          style={{ pathLength, opacity }}
        />
      </svg>
      {/* Floating dots along the path */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full bg-primary/40"
          style={{ opacity }}
          initial={{ scale: 0 }}
          whileInView={{ scale: [0, 1.3, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.2 }}
        />
      ))}
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const ApartmentsSection = () => {
  const residences = apartments.filter((a) => a.category === "residence");
  const penthouse = apartments.find((a) => a.category === "penthouse");
  const compact = apartments.find((a) => a.category === "compact");

  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Gli Appartamenti
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Eleganza fronte mare.
          </h2>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            Otto residenze esclusive, ognuna con la propria personalità. Scopri
            quella perfetta per la tua esperienza a Boa Vista.
          </p>
        </motion.div>

        {/* 6 Main Residences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {residences.map((apt, i) => (
            <motion.div
              key={apt.slug}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <ApartmentCard apt={apt} />
            </motion.div>
          ))}
        </div>

        {/* Flowing connector */}
        <FlowingLine />

        {/* Penthouse + Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {penthouse && (
            <motion.div
              className="lg:col-span-3"
              custom={0}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <ApartmentCard apt={penthouse} featured />
            </motion.div>
          )}
          {compact && (
            <motion.div
              className="lg:col-span-2"
              custom={1}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <ApartmentCard apt={compact} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

interface ApartmentCardProps {
  apt: (typeof apartments)[number];
  featured?: boolean;
}

const ApartmentCard = ({ apt, featured }: ApartmentCardProps) => (
  <Link
    to={`/appartamenti/${apt.slug}`}
    className="group block bg-background overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full"
  >
    {/* Image */}
    <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
      <img
        src={apt.cover}
        alt={apt.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-out">
        <CalendarCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
        <span className="font-sans text-xs tracking-[0.15em] uppercase text-foreground">
          Verifica Disponibilità
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-foreground" />
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
        {apt.tagline}
      </p>
      <h3 className="font-serif text-2xl font-light mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
        {apt.name}
      </h3>

      {/* Quick specs */}
      <div className="flex items-center gap-5 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-sans text-xs">{apt.guests} ospiti</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BedDouble className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-sans text-xs">
            {apt.bedrooms} {apt.bedrooms > 1 ? "camere" : "camera"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Maximize className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-sans text-xs">{apt.sqm} m²</span>
        </div>
      </div>

      {/* Hover underline accent */}
      <div className="mt-5 h-px bg-primary/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </div>
  </Link>
);

export default ApartmentsSection;
