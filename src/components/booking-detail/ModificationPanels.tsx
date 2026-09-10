import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CreditCard, History, Loader2, Pencil, XCircle } from "lucide-react";
import ModificationDiff from "@/components/admin/ModificationDiff";
import { Section } from "./Section";

/** Banner shown while a modification request awaits review. */
export const PendingModificationBanner = ({ pendingMod }: { pendingMod: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="bg-violet-50 border border-violet-200 rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-violet-700" />
        <h3 className="font-sans text-sm font-semibold text-violet-900">In attesa di conferma modifiche</h3>
      </div>
      <p className="font-sans text-xs text-violet-800">
        La tua richiesta è stata ricevuta e sarà valutata dal team.
        {Number(pendingMod.price_diff) !== 0 && (
          <> Differenza stimata: <strong>{Number(pendingMod.price_diff) >= 0 ? "+" : ""}€{Number(pendingMod.price_diff).toFixed(2)}</strong></>
        )}
      </p>
      <div className="bg-white/60 rounded-lg p-3">
        <ModificationDiff current={pendingMod.current_data ?? {}} proposed={pendingMod.requested_changes ?? {}} />
      </div>
      {pendingMod.customer_note && (
        <p className="font-sans text-xs text-violet-800 italic">"{pendingMod.customer_note}"</p>
      )}
    </div>
  </motion.div>
);

/** Stripe payment card for the price difference of an approved modification. */
export const ModificationPaymentCard = ({
  booking, paying, onPay,
}: { booking: any; paying: boolean; onPay: () => void }) => {
  const expired = booking.modification_link_expires_at
    ? Date.now() / 1000 > booking.modification_link_expires_at
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-primary/5 border border-primary/30 rounded-2xl overflow-hidden"
    >
      <div className="p-5 space-y-3 text-center">
        <CreditCard className="w-6 h-6 text-primary mx-auto" />
        <p className="font-sans text-sm text-muted-foreground">Differenza modifica da pagare</p>
        <p className="font-serif text-2xl text-foreground">€{Number(booking.modification_amount_due).toFixed(2)}</p>
        {expired ? (
          <p className="font-sans text-xs text-destructive">Link scaduto. Contatta l'assistenza per riceverne uno nuovo.</p>
        ) : (
          <>
            <button
              onClick={onPay}
              disabled={paying}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-wider uppercase hover:shadow-lg transition-all disabled:opacity-50"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Paga differenza
            </button>
            {booking.modification_link_expires_at && (
              <p className="font-sans text-[10px] text-muted-foreground">
                Link valido fino al {new Date(booking.modification_link_expires_at * 1000).toLocaleString("it-IT")}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

/** CTA to open the modification request dialog. */
export const RequestModificationCta = ({ onOpen }: { onOpen: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border/60 rounded-2xl overflow-hidden"
  >
    <div className="p-5 flex items-center justify-between gap-4">
      <div>
        <p className="font-sans text-sm font-medium text-foreground">Hai bisogno di modificare qualcosa?</p>
        <p className="font-sans text-xs text-muted-foreground">Date, volo, ospiti o servizi: invia una richiesta al team.</p>
      </div>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary/40 text-primary font-sans text-sm hover:bg-primary/5 transition-colors flex-shrink-0"
      >
        <Pencil className="w-3.5 h-3.5" />
        Richiedi modifica
      </button>
    </div>
  </motion.div>
);

/** Reviewed (approved/rejected) modification requests. */
export const ModificationHistorySection = ({ modHistory }: { modHistory: any[] }) => (
  <Section icon={History} title="Storico richieste di modifica" delay={0.18}>
    <div className="space-y-4">
      {modHistory.map((r) => {
        const approved = r.status === "approved";
        return (
          <div key={r.id} className={`rounded-lg border p-4 ${approved ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                approved ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}>
                {approved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {approved ? "Approvata" : "Rifiutata"}
              </span>
              <span className="font-sans text-[10px] text-muted-foreground">
                {new Date(r.reviewed_at ?? r.created_at).toLocaleString("it-IT")}
              </span>
            </div>
            <ModificationDiff current={r.current_data ?? {}} proposed={r.requested_changes ?? {}} />
            {Number(r.price_diff) !== 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Differenza:{" "}
                <span className={Number(r.price_diff) > 0 ? "text-amber-700 font-medium" : "text-emerald-700 font-medium"}>
                  {Number(r.price_diff) >= 0 ? "+" : ""}€{Number(r.price_diff).toFixed(2)}
                </span>
              </p>
            )}
            {r.customer_note && <p className="mt-2 text-xs italic text-muted-foreground">"{r.customer_note}"</p>}
            {r.admin_note && (
              <p className="mt-2 text-xs text-foreground bg-background/60 rounded p-2 border border-border/40">
                <strong className="text-muted-foreground">Nota team:</strong> {r.admin_note}
              </p>
            )}
            {!approved && r.rejection_reason && (
              <p className="mt-2 text-xs text-red-700">
                <strong>Motivo rifiuto:</strong> {r.rejection_reason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  </Section>
);
