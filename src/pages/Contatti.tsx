import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { useRef, MouseEvent as ReactMouseEvent } from "react";
import heroImg from "@/assets/hero-contatti.jpg";

/* ── 3D tilt card ── */
const TiltCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMouse = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Contact items ── */
const contacts = [
  {
    icon: Phone,
    label: "Telefono",
    value: "+238 000 0000",
    sub: "Lun – Sab · 9:00 – 18:00",
    href: "tel:+2380000000",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/15",
    delay: 0,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Scrivici su WhatsApp",
    sub: "Risposta entro poche ore",
    href: "https://wa.me/2380000000",
    gradient: "from-[#25D366]/15 to-[#25D366]/5",
    iconBg: "bg-[#25D366]/15",
    delay: 0.15,
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@bazhouse.it",
    sub: "Ti rispondiamo entro 24h",
    href: "mailto:info@bazhouse.it",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/15",
    delay: 0.3,
  },
];

/* ── Floating orb ── */
const FloatingOrb = ({
  size,
  x,
  y,
  duration,
  delay,
}: {
  size: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
}) => (
  <motion.div
    className="absolute rounded-full bg-primary/10 blur-3xl pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const Contatti = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <PageTransition>
      <Navbar />
      <main>
        {/* Hero with parallax */}
        <section
          ref={heroRef}
          className="relative h-[55vh] min-h-[420px] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${heroImg})`, y: heroY, scale: heroScale }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-overlay-from)/0.5)] to-[hsl(var(--hero-overlay-to)/0.7)]" />
          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-sans text-xs tracking-[0.3em] uppercase text-[hsl(var(--hero-text-muted))] mb-4"
            >
              Contattaci
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-3xl md:text-5xl font-light text-[hsl(var(--hero-text))] leading-tight"
            >
              Parliamo del tuo soggiorno a Boa Vista.
            </motion.h1>
          </motion.div>
        </section>

        {/* Contact cards section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          {/* Floating orbs background */}
          <FloatingOrb size={300} x="10%" y="20%" duration={8} delay={0} />
          <FloatingOrb size={200} x="70%" y="60%" duration={10} delay={2} />
          <FloatingOrb size={250} x="50%" y="10%" duration={9} delay={1} />

          <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-primary mx-auto mb-6"
              />
              <h2 className="font-serif text-2xl md:text-4xl font-light mb-4">
                Come raggiungerci
              </h2>
              <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto">
                Scegli il canale che preferisci. Siamo sempre disponibili per aiutarti a organizzare la tua esperienza.
              </p>
            </motion.div>

            {/* 3D tilt contact cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contacts.map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: item.delay }}
                  style={{ perspective: 800 }}
                >
                  <TiltCard>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className={`block p-8 bg-gradient-to-br ${item.gradient} border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-500 group`}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Icon floating above card */}
                      <motion.div
                        className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6`}
                        style={{ transform: "translateZ(40px)" }}
                        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.6 }}
                      >
                        <item.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                      </motion.div>

                      <div style={{ transform: "translateZ(25px)" }}>
                        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                          {item.label}
                        </p>
                        <p className="font-serif text-lg md:text-xl font-light mb-2 group-hover:text-primary transition-colors duration-300">
                          {item.value}
                        </p>
                        <p className="font-sans text-xs text-muted-foreground">
                          {item.sub}
                        </p>
                      </div>

                      {/* Animated arrow */}
                      <motion.div
                        className="mt-6 font-sans text-xs tracking-[0.2em] uppercase text-primary flex items-center gap-2"
                        style={{ transform: "translateZ(30px)" }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Contattaci
                        </span>
                        <motion.span
                          className="inline-block"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          →
                        </motion.span>
                      </motion.div>
                    </a>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            {/* Location info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-20"
              style={{ perspective: 600 }}
            >
              <TiltCard className="bg-secondary/50 backdrop-blur-sm border border-border/30 p-10 md:p-14">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                    style={{ transform: "translateZ(30px)" }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <MapPin className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <div style={{ transform: "translateZ(20px)" }}>
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                      Dove siamo
                    </p>
                    <p className="font-serif text-xl md:text-2xl font-light mb-2">
                      Praia Cabral & Praia da Cruz
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">
                      Boa Vista, Capo Verde — Il tuo spazio sull'oceano
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-20 text-center"
            >
              <p className="font-serif text-2xl md:text-3xl italic leading-relaxed text-foreground/80">
                "Vivi Boa Vista dal tuo spazio sull'oceano."
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Contatti;
