import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Wallet, Plus } from "lucide-react";
import { getPaymentMethodLabel } from "@/lib/bookingStatus";

interface Props {
  booking: any;
  manualPayments: any[];
  onAdd: () => void;
}

const ManualPaymentsCard = ({ booking, manualPayments, onAdd }: Props) => {
  const canAdd = booking.amount_paid < booking.total_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.5 }}
      className="bg-white border border-border rounded-sm shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60 bg-secondary/30">
        <div className="flex items-center gap-2.5">
          <Wallet className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground/70 font-medium">
            Pagamenti offline ({manualPayments.length})
          </h3>
        </div>
        {canAdd && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="flex items-center gap-1.5 font-sans text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
          >
            <Plus className="w-3 h-3" />
            Registra pagamento
          </motion.button>
        )}
      </div>
      <div className="p-5">
        {manualPayments.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground/60 italic text-center py-3">
            Nessun pagamento offline registrato.
            {canAdd && " Usa il pulsante in alto per registrare contanti, bonifici o altri pagamenti ricevuti fuori da Stripe."}
          </p>
        ) : (
          <div className="divide-y divide-border/30">
            {manualPayments.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm font-semibold text-foreground">€{p.amount}</span>
                    <span className="font-sans text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-secondary text-muted-foreground">
                      {getPaymentMethodLabel(p.method, p.custom_method)}
                    </span>
                  </div>
                  {p.notes && (
                    <p className="font-sans text-xs text-muted-foreground mt-1 italic">{p.notes}</p>
                  )}
                </div>
                <span className="font-sans text-[10px] text-muted-foreground/60 flex-shrink-0">
                  {format(new Date(p.created_at), "d MMM yyyy, HH:mm", { locale: it })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManualPaymentsCard;
