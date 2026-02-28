import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { useState, useRef } from "react";
import heroImg from "@/assets/hero-contatti.jpg";

const Contatti = () => {
  const [form, setForm] = useState({ nome: "", email: "", messaggio: "" });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Grazie per il tuo messaggio! Ti risponderemo al più presto.");
    setForm({ nome: "", email: "", messaggio: "" });
  };

  return (
    <PageTransition>
      <Navbar />
      <main>
        {/* Hero with parallax */}
        <section
          ref={heroRef}
          className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            className="absolute inset-[-15%] bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${heroImg})`, y: heroY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-overlay-from)/0.5)] to-[hsl(var(--hero-overlay-to)/0.7)]" />
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
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
              Scopri la disponibilità dei nostri appartamenti vista oceano.
            </motion.h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              {/* Form — 3 cols */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-3 space-y-8"
              >
                <div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-[1px] bg-primary mb-6"
                  />
                  <h2 className="font-serif text-2xl md:text-3xl font-light mb-2">
                    Scrivici un messaggio
                  </h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    Compila il form e ti risponderemo entro 24 ore.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      required
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
                    Messaggio
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.messaggio}
                    onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="inline-flex items-center gap-3 font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  Invia Messaggio
                </motion.button>
              </motion.form>

              {/* Info — 2 cols */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-2 space-y-8"
              >
                <div className="bg-secondary p-8 space-y-8">
                  <div>
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
                      Informazioni
                    </p>
                  </div>

                  {[
                    {
                      icon: MapPin,
                      title: "Posizione",
                      lines: ["Praia Cabral & Praia da Cruz", "Boa Vista, Capo Verde"],
                    },
                    {
                      icon: Mail,
                      title: "Email",
                      lines: ["info@bazhouse.it"],
                    },
                    {
                      icon: Phone,
                      title: "WhatsApp",
                      lines: ["Disponibile su richiesta"],
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium">{item.title}</p>
                        {item.lines.map((l) => (
                          <p key={l} className="font-sans text-sm text-muted-foreground mt-0.5">
                            {l}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="p-8 border border-border"
                >
                  <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
                    Nota
                  </p>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    Il trasferimento aeroporto A/R è incluso nel soggiorno.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="pt-4"
                >
                  <p className="font-serif text-xl md:text-2xl italic leading-relaxed">
                    "Vivi Boa Vista dal tuo spazio sull'oceano."
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Contatti;
