import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, Ban } from "lucide-react";
import { DEPOSIT_PERCENT_LABEL, DEPOSIT_RATE, calcDeposit } from "@/lib/bookingDeposit";

interface CancelBookingCardProps {
  booking: any;
  /** Performs the cancellation; returns false when it failed. */
  onCancel: () => Promise<boolean>;
}

const CancelBookingCard = ({ booking, onCancel }: CancelBookingCardProps) => {
  const [step, setStep] = useState(0);
  const [confirmText, setConfirmText] = useState("");

  const depositAmount = booking.deposit_amount || calcDeposit(booking.total_price);
  const paidBalance = Math.round((booking.amount_paid - depositAmount) * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.58 }}
      className="bg-card border border-destructive/30 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="p-6 space-y-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-destructive/70 hover:text-destructive transition-colors font-sans text-sm"
              >
                <Ban className="w-4 h-4" />
                Annulla prenotazione
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-sans text-sm font-semibold text-amber-800">Attenzione: conseguenze dell'annullamento</p>
                  <ul className="font-sans text-sm text-amber-700 space-y-1.5 list-disc list-inside">
                    <li><strong>La caparra del {DEPOSIT_PERCENT_LABEL} non è rimborsabile</strong> in nessun caso.</li>
                    <li>Per il rimborso del saldo rimanente, si applica la nostra <Link to="/refund-policy" className="underline font-medium hover:text-amber-900" target="_blank">Refund Policy</Link>.</li>
                    <li>Per richiedere il rimborso del saldo, dovrai contattare l'assistenza.</li>
                    <li>L'annullamento è <strong>irreversibile</strong>.</li>
                  </ul>
                </div>
              </div>

              {booking.amount_paid > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="font-sans text-sm text-red-700 space-y-1">
                    <p><strong>Riepilogo economico:</strong></p>
                    <p>Caparra versata (non rimborsabile): <strong>€{depositAmount}</strong></p>
                    {booking.amount_paid > (booking.deposit_amount || booking.total_price * DEPOSIT_RATE) && (
                      <p>Saldo versato (rimborsabile secondo policy): <strong>€{paidBalance}</strong></p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-destructive/10 text-destructive rounded-lg font-sans text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  Ho capito, continua
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-sans text-sm font-semibold text-red-800">Conferma finale</p>
                  <p className="font-sans text-sm text-red-700">
                    Per confermare l'annullamento, digita <strong>ANNULLA</strong> nel campo sottostante.
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder='Digita "ANNULLA"'
                className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50 transition-all"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setStep(1); setConfirmText(""); }}
                  className="px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Indietro
                </button>
                <button
                  disabled={confirmText !== "ANNULLA"}
                  onClick={async () => {
                    setStep(3);
                    const ok = await onCancel();
                    if (!ok) setStep(2);
                  }}
                  className="px-5 py-2 bg-destructive text-destructive-foreground rounded-lg font-sans text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-destructive/90"
                >
                  Annulla prenotazione
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-destructive border-t-transparent rounded-full mx-auto mb-3"
              />
              <p className="font-sans text-sm text-muted-foreground">Annullamento in corso...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CancelBookingCard;
