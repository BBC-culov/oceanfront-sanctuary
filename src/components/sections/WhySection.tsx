import { motion } from "framer-motion";
import interiorImage from "@/assets/apartment-interior.jpg";

const paragraphVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.15 * i, ease: "easeOut" as const },
  }),
};

const WhySection = () => (
  <section className="py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Perché BAZHOUSE
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-8">
            Più libertà. Più comfort.
            <br />
            Più esperienza.
          </h2>

          <div className="space-y-4">
            {[
              "Bazhouse nasce per chi desidera vivere Boa Vista in modo autentico, elegante e indipendente.",
              "I nostri appartamenti, recentemente ristrutturati e completamente arredati, si trovano in due delle zone più prestigiose dell'isola: Praia Cabral e Praia da Cruz, con splendida vista sull'oceano e a pochi minuti dal centro.",
              "Qui non soggiorni in un villaggio turistico. Qui hai la libertà di vivere l'isola senza orari, senza programmi imposti e senza limitazioni.",
              "Goditi il comfort, la qualità degli appartamenti e la vista sull'Atlantico, ma con la possibilità di scoprire Boa Vista nel modo più autentico: esplorando l'isola, incontrando la cultura locale e vivendo un'esperienza davvero immersiva.",
              "Bazhouse unisce il lusso di una residenza sul mare alla libertà di vivere Boa Vista come un locale.",
            ].map((text, i) => (
              <motion.p
                key={i}
                custom={i}
                variants={paragraphVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="font-sans text-base leading-relaxed text-muted-foreground"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <img
            src={interiorImage}
            alt="Interno appartamento BAZHOUSE vista oceano"
            className="w-full aspect-[4/3] object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5" />
        </motion.div>
      </div>
    </div>
  </section>
);

export default WhySection;
