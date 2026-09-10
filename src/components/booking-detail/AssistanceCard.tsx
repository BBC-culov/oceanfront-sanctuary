import { motion } from "framer-motion";
import { Headphones, Mail, MessageCircle } from "lucide-react";
import { BRAND_CONTACTS } from "@/lib/contacts";

/** Support block with WhatsApp and contact page shortcuts. */
const AssistanceCard = ({ onContact }: { onContact: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="p-6 sm:p-8 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Headphones className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-serif text-xl text-foreground mb-1">Hai bisogno di assistenza?</h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Se hai domande o problemi con la tua prenotazione, il nostro team è pronto ad aiutarti.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <motion.a
          href={BRAND_CONTACTS.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-sans text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-lg"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </motion.a>
        <motion.button
          onClick={onContact}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-lg"
        >
          <Mail className="w-4 h-4" />
          Contattaci
        </motion.button>
      </div>
    </div>
  </motion.div>
);

export default AssistanceCard;
