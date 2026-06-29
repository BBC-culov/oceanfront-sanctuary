import { motion } from "framer-motion";

const paragraphs = [
  "Boa Vista è una delle destinazioni più affascinanti dell'Atlantico. Un'isola ancora autentica, dove la natura è rimasta protagonista e la qualità della vita si misura nel tempo, nello spazio e nella libertà.",
  "Con oltre 300 giorni di sole all'anno, temperature comprese tra 22°C e 30°C, una piacevole brezza oceanica e alcune delle spiagge più spettacolari dell'Africa, Boa Vista offre condizioni ideali per vivere ogni stagione dell'anno.",
  "Ma ciò che rende davvero speciale quest'isola è il suo equilibrio tra bellezza naturale e prospettive di crescita.",
  "Sempre più persone scelgono Boa Vista come seconda casa, destinazione per il lavoro da remoto o investimento immobiliare, attratte da un mercato ancora giovane, da un turismo internazionale in costante espansione e da un contesto stabile e accogliente.",
];

const BoaVistaDescriptionSection = () => (
  <section className="py-24 lg:py-32">
    <div className="mx-auto max-w-4xl px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">
          Boa Vista
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] mb-6 text-center text-balance">
          L'isola dove vivere meglio.
        </h2>
        <p className="font-serif italic text-2xl md:text-3xl text-primary/80 leading-snug mb-12 text-center text-balance">
          Investire con una visione.
        </p>
        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="font-sans text-base md:text-lg leading-relaxed text-muted-foreground text-balance"
            >
              {p}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default BoaVistaDescriptionSection;
