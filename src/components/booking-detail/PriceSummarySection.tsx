import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, Receipt } from "lucide-react";
import { Section } from "./Section";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Stay total, deposit paid and remaining balance. */
export const PriceSummarySection = ({ booking, nights }: { booking: any; nights: number }) => {
  const paid = booking.amount_paid || 0;

  return (
    <Section icon={Receipt} title="Riepilogo costi" delay={0.5}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm text-muted-foreground">Totale soggiorno ({nights} notti)</span>
          <span className="font-serif text-xl font-medium text-foreground">€{booking.total_price}</span>
        </div>
        {paid >= booking.total_price ? (
          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-sans text-sm font-semibold text-emerald-700">Prenotazione saldata completamente</span>
          </div>
        ) : booking.payment_type === "deposit" ? (
          <>
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="font-sans text-sm text-muted-foreground">Caparra versata</span>
              <span className="font-sans text-sm font-medium text-emerald-600">€{paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-semibold text-foreground">Saldo rimanente</span>
              <span className="font-sans text-sm font-semibold text-foreground">
                €{round2(booking.total_price - paid)}
              </span>
            </div>
          </>
        ) : paid > 0 ? (
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="font-sans text-sm text-muted-foreground">Pagato</span>
            <span className="font-sans text-sm font-medium text-emerald-600">€{paid}</span>
          </div>
        ) : null}
      </div>
    </Section>
  );
};

/** Informational card about the outstanding balance (no payment button). */
export const RemainingBalanceCard = ({ booking }: { booking: any }) => {
  const remaining = round2(booking.total_price - (booking.amount_paid || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="bg-primary/5 border border-primary/20 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CreditCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-sans text-sm text-muted-foreground">Saldo rimanente</p>
          <p className="font-serif text-2xl text-foreground font-medium">€{remaining}</p>
        </div>
        <p className="font-sans text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
          La contatteremo per organizzare il pagamento del saldo finale prima del check-in.
        </p>
      </div>
    </motion.div>
  );
};
