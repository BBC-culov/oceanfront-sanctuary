import { motion } from "framer-motion";
import { MapPin, Globe2, Home, ShieldCheck, Smartphone, HeartHandshake } from "lucide-react";
import interiorImage from "@/assets/apartment-interior.jpg";

const pillars = [
  {
    icon: MapPin,
    title: "Location selezionate",
    text: "Realizziamo progetti solo in posizioni che riteniamo realmente esclusive, dove qualità della vita, attrattività e potenziale di valorizzazione si incontrano.",
  },
  {
    icon: Globe2,
    title: "Visione europea, presenza locale",
    text: "BazHouse è un marchio di EasyClick, società europea con una presenza diretta a Capo Verde. Uniamo trasparenza, organizzazione e conoscenza del territorio per seguire ogni fase dell'investimento.",
  },
  {
    icon: Home,
    title: "Una casa da vivere e da valorizzare",
    text: "Le nostre residenze sono progettate per offrirti il piacere di una casa sull'oceano e, quando non la utilizzi, la possibilità di affidarla a operatori locali qualificati per gli affitti turistici.",
  },
  {
    icon: ShieldCheck,
    title: "Gestione professionale",
    text: "Collaboriamo con partner selezionati per la gestione della proprietà, affinché il tuo immobile sia seguito con standard elevati e con l'obiettivo di valorizzarne il potenziale nel tempo.",
  },
  {
    icon: Smartphone,
    title: "Tecnologia e controllo",
    text: "Mettiamo a disposizione strumenti digitali che consentono di monitorare la gestione della proprietà, le prenotazioni e le principali attività, ovunque tu sia.",
  },
  {
    icon: HeartHandshake,
    title: "Un rapporto che continua nel tempo",
    text: "Per noi la consegna delle chiavi non è la fine del percorso, ma l'inizio. Continuiamo a supportare i nostri clienti nella gestione, nella valorizzazione e, se lo desiderano, anche nella futura rivendita della proprietà.",
  },
];

const WhySection = () => (
  <section className="py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mb-16 lg:mb-20"
      >
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Perché BAZHOUSE
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] mb-6 text-balance">
          Perché scegliere BazHouse
        </h2>
        <p className="font-serif italic text-2xl md:text-3xl text-primary/80 leading-snug mb-8 text-balance">
          Un investimento immobiliare vale quanto il partner che lo accompagna.
        </p>
        <p className="font-sans text-base md:text-lg leading-relaxed text-muted-foreground">
          Acquistare una casa significa fare una scelta importante. Per questo BazHouse non si limita a sviluppare residenze esclusive: accompagna ogni cliente nella costruzione e nella valorizzazione del proprio patrimonio, dalla scelta dell'immobile fino alla sua gestione nel tempo.
        </p>
      </motion.div>

      {/* Image + pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 lg:sticky lg:top-28"
        >
          <div className="relative">
            <img
              src={interiorImage}
              alt="Residenza BazHouse vista oceano a Boa Vista"
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5" />
          </div>
        </motion.div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 * i, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary mb-4">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium leading-snug mb-2">
                  {p.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Closing */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-20 lg:mt-28 max-w-4xl mx-auto text-center border-t border-border/60 pt-16"
      >
        <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-snug text-balance mb-6">
          BazHouse non vende semplicemente immobili.
        </p>
        <p className="font-sans text-base md:text-lg leading-relaxed text-muted-foreground text-balance">
          Seleziona luoghi straordinari, realizza residenze di qualità e accompagna ogni cliente nel trasformare una casa in un patrimonio da vivere e valorizzare nel tempo.
        </p>
      </motion.div>
    </div>
  </section>
);

export default WhySection;
