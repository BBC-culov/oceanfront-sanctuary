import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, ChefHat, BedDouble, Bath, Utensils, Sun } from "lucide-react";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import interiorImg from "@/assets/apartment-interior.jpg";

const features = [
  { icon: Eye, label: "Vista mare o fronte oceano" },
  { icon: ChefHat, label: "Cucina completamente attrezzata" },
  { icon: BedDouble, label: "Camere luminose e spaziose" },
  { icon: Bath, label: "Bagno moderno" },
  { icon: Utensils, label: "Utensili completi" },
  { icon: Sun, label: "Spazi ampi e raffinati" },
];

const images = [kitchenImg, bedroomImg, interiorImg];

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
          Ogni appartamento BAZHOUSE è progettato per offrire comfort totale e
          qualità superiore. Spazi ampi, luminosi e raffinati con attenzione ai
          dettagli.
        </p>
      </motion.div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="overflow-hidden group"
          >
            <img
              src={img}
              alt={`Appartamento BAZHOUSE ${i + 1}`}
              className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <f.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
            <span className="font-sans text-sm text-foreground">{f.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/contatti">
          <motion.span
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="inline-block font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Richiedi Disponibilità
          </motion.span>
        </Link>
      </div>
    </div>
  </section>
);

export default ApartmentsSection;
