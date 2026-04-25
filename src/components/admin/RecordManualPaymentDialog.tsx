import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PAYMENT_METHODS } from "@/lib/bookingStatus";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  totalPrice: number;
  amountPaid: number;
  onRecorded: (newAmountPaid: number, fullySaldata: boolean) => void;
}

const RecordManualPaymentDialog = ({
  open, onClose, bookingId, totalPrice, amountPaid, onRecorded,
}: Props) => {
  const remaining = Math.max(0, Math.round((totalPrice - amountPaid) * 100) / 100);
  const [amount, setAmount] = useState(remaining.toString());
  const [method, setMethod] = useState<string>("cash");
  const [customMethod, setCustomMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast({ title: "Importo non valido", variant: "destructive" });
      return;
    }
    if (method === "other" && !customMethod.trim()) {
      toast({ title: "Specifica il metodo di pagamento", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessione scaduta");

      // 1. Insert manual payment record
      const { error: pErr } = await supabase.from("manual_payments").insert({
        booking_id: bookingId,
        amount: num,
        method,
        custom_method: method === "other" ? customMethod.trim() : null,
        notes: notes.trim() || null,
        recorded_by: user.id,
      });
      if (pErr) throw pErr;

      // 2. Update booking amount_paid + status
      const newAmountPaid = Math.round((amountPaid + num) * 100) / 100;
      const fullySaldata = newAmountPaid >= totalPrice;
      const updates: Record<string, unknown> = { amount_paid: newAmountPaid };
      if (fullySaldata) {
        // Fully paid -> automatically confirmed + paid
        updates.status = "paid";
      }

      const { error: uErr } = await supabase
        .from("bookings")
        .update(updates as any)
        .eq("id", bookingId);
      if (uErr) throw uErr;

      toast({
        title: fullySaldata ? "Prenotazione saldata" : "Pagamento registrato",
        description: fullySaldata
          ? "La prenotazione risulta ora saldata e confermata."
          : `Saldo aggiornato: €${newAmountPaid.toFixed(2)} / €${totalPrice.toFixed(2)}`,
      });

      onRecorded(newAmountPaid, fullySaldata);
      onClose();
      // Reset form for next opening
      setAmount(remaining.toString());
      setMethod("cash");
      setCustomMethod("");
      setNotes("");
    } catch (e: any) {
      toast({
        title: "Errore",
        description: e?.message || "Errore nel salvataggio del pagamento",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-md bg-white border border-border rounded-sm shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <h2 className="font-sans text-sm font-semibold text-foreground tracking-wide">
                  Registra pagamento offline
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-secondary/40 border border-border/60 rounded-sm p-3 text-xs font-sans text-muted-foreground">
                Saldo dovuto:{" "}
                <span className="font-semibold text-foreground">€{remaining.toFixed(2)}</span>{" "}
                su €{totalPrice.toFixed(2)}
              </div>

              <div className="space-y-1.5">
                <Label className="font-sans text-xs">Metodo di pagamento *</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {method === "other" && (
                <div className="space-y-1.5">
                  <Label className="font-sans text-xs">Specifica metodo *</Label>
                  <Input
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value)}
                    placeholder="Es. PayPal, assegno..."
                    maxLength={80}
                    className="font-sans"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="font-sans text-xs">Importo (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-sans"
                />
                <p className="font-sans text-[11px] text-muted-foreground">
                  Se l'importo copre l'intero saldo, la prenotazione passerà automaticamente a "Saldata".
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-sans text-xs">Note (opzionale)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Eventuali dettagli aggiuntivi..."
                  rows={3}
                  maxLength={500}
                  className="font-sans resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-secondary/20">
              <button
                onClick={onClose}
                disabled={submitting}
                className="font-sans text-xs font-medium px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Annulla
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide px-4 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvataggio...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conferma
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RecordManualPaymentDialog;
