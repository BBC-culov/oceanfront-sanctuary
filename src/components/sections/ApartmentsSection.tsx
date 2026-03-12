import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, BedDouble, Maximize, CalendarCheck } from "lucide-react";
import apartments from "@/data/apartments";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {residences.map((apt, i) => (
            <ApartmentCard key={apt.slug} apt={apt} delay={i * 0.1} />
          ))}
        </div>

        {/* Decorative connector */}
        <motion.div
          className="flex items-center justify-center gap-3 my-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent flex-1 max-w-[200px]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary/30"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent flex-1 max-w-[200px]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </motion.div>

        {/* Penthouse + Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {penthouse && (
            <div className="md:col-span-2">
              <ApartmentCard apt={penthouse} delay={0} featured />
            </div>
          )}
          {compact && (
            <div className="md:col-span-1">
              <ApartmentCard apt={compact} delay={0.1} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface ApartmentCardProps {
  apt: (typeof apartments)[number];
  delay: number;
  featured?: boolean;
}

const ApartmentCard = ({ apt, delay, featured }: ApartmentCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    <Link
      to={`/appartamenti/${apt.slug}`}
      className="group block bg-background overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 h-full"
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <img
          src={apt.cover}
          alt={apt.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
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
        <h3 className="font-serif text-2xl font-light mb-4 text-foreground">
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
      </div>
    </Link>
  </motion.div>
);

export default ApartmentsSection;
