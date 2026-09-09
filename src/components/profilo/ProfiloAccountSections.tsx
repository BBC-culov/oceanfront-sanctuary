import { motion } from "framer-motion";
import { Download, Headphones, KeyRound, Shield, Trash2 } from "lucide-react";
import { AnimatedSection } from "./ProfiloUi";

/** GDPR data export block. */
export const DataExportSection = ({ onExport }: { onExport: () => void }) => (
  <AnimatedSection delay={0.38} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
      <motion.div
        whileHover={{ rotate: -10, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Download className="w-4 h-4 text-primary" />
      </motion.div>
      <h2 className="font-serif text-xl text-foreground">Esporta i Tuoi Dati</h2>
    </div>
    <div className="p-6">
      <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
        Ai sensi del GDPR, puoi scaricare una copia di tutti i tuoi dati personali in formato JSON.
      </p>
      <motion.button
        onClick={onExport}
        whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.3)" }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300"
      >
        <Download size={15} />
        Scarica i miei dati
      </motion.button>
    </div>
  </AnimatedSection>
);

/** Password update + account deletion block. */
export const AccountManagementSection = ({
  onUpdatePassword, onDeleteRequest,
}: { onUpdatePassword: () => void; onDeleteRequest: () => void }) => (
  <AnimatedSection delay={0.45} className="bg-card rounded-2xl border border-destructive/20 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
      <motion.div
        whileHover={{ rotate: 15, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center"
      >
        <Shield className="w-4 h-4 text-destructive" />
      </motion.div>
      <h2 className="font-serif text-xl text-foreground">Gestione Account</h2>
    </div>

    <div className="p-6">
      <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
        Gestisci la sicurezza del tuo account. Puoi aggiornare la password o eliminare definitivamente il tuo account.
      </p>
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={onUpdatePassword}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.2)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/30 text-primary rounded-lg font-sans text-sm tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <KeyRound size={15} />
          Aggiorna Password
        </motion.button>
        <motion.button
          onClick={onDeleteRequest}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--destructive) / 0.2)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-destructive/30 text-destructive rounded-lg font-sans text-sm tracking-widest uppercase hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
        >
          <Trash2 size={15} />
          Elimina Account
        </motion.button>
      </div>
    </div>
  </AnimatedSection>
);

/** Support block. */
export const AssistanceSection = ({ onContact }: { onContact: () => void }) => (
  <AnimatedSection delay={0.55} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
      <motion.div
        whileHover={{ rotate: -10, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Headphones className="w-4 h-4 text-primary" />
      </motion.div>
      <h2 className="font-serif text-xl text-foreground">Assistenza</h2>
    </div>

    <div className="p-6">
      <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
        Hai bisogno di aiuto o hai domande sulla tua prenotazione? Il nostro team è a tua disposizione per assisterti.
      </p>
      <motion.button
        onClick={onContact}
        whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px hsl(var(--primary) / 0.2)" }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300"
      >
        <Headphones size={15} />
        Richiedi Assistenza
      </motion.button>
    </div>
  </AnimatedSection>
);
