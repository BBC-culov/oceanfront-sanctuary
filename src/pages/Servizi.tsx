import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Home,
  Eye,
  MapPin,
  Plane,
  Sparkles,
  ShoppingCart,
  Bike,
  Calendar,
  Compass,
  Waves as Pool,
  HeadphonesIcon,
} from "lucide-react";

const included = [
  { icon: Home, label: "Appartamento completamente arredato" },
  { icon: Eye, label: "Vista mare" },
  { icon: MapPin, label: "Zona residenziale esclusiva" },
  { icon: Plane, label: "Trasferimento aeroporto A/R" },
];

const onRequest = [
  { icon: Sparkles, label: "Pulizia extra" },
  { icon: ShoppingCart, label: "Spesa a domicilio" },
  { icon: Bike, label: "Noleggio biciclette" },
  { icon: Calendar, label: "Prenotazione attività" },
  { icon: Compass, label: "Tour sull'isola" },
  { icon: Pool, label: "Accesso piscina" },
  { icon: HeadphonesIcon, label: "Supporto personalizzato" },
];

const ServiceCard = ({ icon: Icon, label, i }: { icon: any; label: string; i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i * 0.08 }}
    className="flex items-center gap-4 p-6 border border-border hover:bg-secondary transition-all duration-500"
  >
    <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
    <span className="font-sans text-sm">{label}</span>
  </motion.div>
);

const Servizi = () => (
  <>
    <Navbar />
    <main>
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="font-serif text-4xl md:text-6xl font-light mb-4">Servizi</h1>
            <p className="font-sans text-base text-muted-foreground">
              Tutto ciò di cui hai bisogno, senza compromessi.
            </p>
          </motion.div>

          <div className="mb-20">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8">
              Servizi Inclusi
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {included.map((s, i) => (
                <ServiceCard key={i} icon={s.icon} label={s.label} i={i} />
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8">
              Servizi su Richiesta
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onRequest.map((s, i) => (
                <ServiceCard key={i} icon={s.icon} label={s.label} i={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Servizi;
