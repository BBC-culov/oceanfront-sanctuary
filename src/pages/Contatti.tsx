import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import { useState } from "react";

const Contatti = () => {
  const [form, setForm] = useState({ nome: "", email: "", messaggio: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder
    alert("Grazie per il tuo messaggio! Ti risponderemo al più presto.");
    setForm({ nome: "", email: "", messaggio: "" });
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
                Scopri la disponibilità dei nostri appartamenti vista oceano.
              </h1>
              <p className="font-sans text-base text-muted-foreground max-w-xl mx-auto">
                Contattaci per ricevere informazioni, verificare disponibilità o
                creare un soggiorno personalizzato.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 font-sans text-sm focus:outline-none focus:border-foreground transition-colors"
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
                    className="w-full bg-transparent border-b border-border py-3 font-sans text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2">
                    Messaggio
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.messaggio}
                    onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 font-sans text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors duration-300 w-full sm:w-auto"
                >
                  Invia Messaggio
                </button>
              </motion.form>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-8"
              >
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-sm font-medium">Posizione</p>
                    <p className="font-sans text-sm text-muted-foreground mt-1">
                      Praia Cabral & Praia da Cruz
                      <br />
                      Boa Vista, Capo Verde
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-sm font-medium">Email</p>
                    <p className="font-sans text-sm text-muted-foreground mt-1">
                      info@bazhouse.it
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-sm font-medium">WhatsApp</p>
                    <p className="font-sans text-sm text-muted-foreground mt-1">
                      Disponibile su richiesta
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-secondary">
                  <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                    Nota
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">
                    Il trasferimento aeroporto A/R è incluso nel soggiorno.
                  </p>
                </div>

                <div className="border-t border-border pt-8">
                  <p className="font-serif text-xl italic">
                    Vivi Boa Vista dal tuo spazio sull'oceano.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contatti;
