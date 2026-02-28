import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, BedDouble, Maximize } from "lucide-react";
import apartments from "@/data/apartments";

const ApartmentsSection = () => (
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
          Tre residenze esclusive, ognuna con la propria personalità. Scopri
          quella perfetta per la tua esperienza a Boa Vista.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {apartments.map((apt, i) => (
          <motion.div
            key={apt.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <Link
              to={`/appartamenti/${apt.slug}`}
              className="group block bg-background overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={apt.cover}
                  alt={apt.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500"
                >
                  <span className="font-sans text-xs tracking-[0.15em] uppercase text-foreground">
                    Scopri
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-foreground" />
                </motion.div>
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
        ))}
      </div>
    </div>
  </section>
);

export default ApartmentsSection;
