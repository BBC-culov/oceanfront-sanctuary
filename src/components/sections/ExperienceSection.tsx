import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Waves,
  Car,
  Bike,
  ShoppingCart,
  Sparkles,
  Palmtree,
} from "lucide-react";

const services = [
  { icon: UtensilsCrossed, label: "Ristoranti selezionati" },
  { icon: Waves, label: "Scuole di surf e windsurf" },
  { icon: Car, label: "Noleggio quad e auto" },
  { icon: Bike, label: "Biciclette" },
  { icon: ShoppingCart, label: "Supermercati convenzionati" },
  { icon: Sparkles, label: "Spa e centri benessere" },
  { icon: Palmtree, label: "Beach club e locali" },
];

const ExperienceSection = () => (
  <section className="py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          L'Esperienza BAZHOUSE
        </p>
        <h2 className="font-serif text-3xl md:text-5xl font-light leading-tight mb-6">
          Entrare nel circuito BAZHOUSE significa accedere a qualcosa in più.
        </h2>
        <p className="font-sans text-base text-muted-foreground">
          Ogni ospite entra automaticamente in un circuito di vantaggi riservati.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group border border-border p-8 hover:bg-secondary transition-all duration-500"
          >
            <s.icon
              className="w-6 h-6 text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300"
              strokeWidth={1.5}
            />
            <p className="font-sans text-sm tracking-wide">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center border-t border-border pt-12"
      >
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Servizi opzionali
        </p>
        <p className="font-sans text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Pulizia, spesa a domicilio, trasferimento aeroporto A/R, accesso
          piscina, tour privati.
        </p>
        <p className="font-serif text-xl md:text-2xl mt-8 italic">
          Tu scegli il livello di servizio. Noi ti garantiamo l'accesso.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ExperienceSection;
