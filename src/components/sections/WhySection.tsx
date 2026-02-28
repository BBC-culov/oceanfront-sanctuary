import { motion } from "framer-motion";
import interiorImage from "@/assets/apartment-interior.jpg";

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
          <p className="font-sans text-base leading-relaxed text-muted-foreground">
            BAZHOUSE nasce per chi desidera vivere Boa Vista in modo autentico,
            elegante e indipendente. I nostri appartamenti, recentemente
            ristrutturati e completamente arredati, si trovano in due delle zone
            più prestigiose dell'isola: Praia Cabral e Praia da Cruz.
          </p>
          <p className="font-sans text-base leading-relaxed text-muted-foreground mt-4">
            Vista oceano aperta, posizione residenziale tranquilla e a pochi
            minuti dal centro. Qui non soggiorni in un villaggio turistico. Qui
            affitti il tuo spazio esclusivo sull'Atlantico.
          </p>
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
