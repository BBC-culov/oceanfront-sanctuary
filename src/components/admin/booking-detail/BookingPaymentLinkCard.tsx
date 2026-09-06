import { motion } from "framer-motion";
import { CreditCard, XCircle, Link as LinkIcon, Copy, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DEPOSIT_RATE } from "@/lib/bookingDeposit";

interface Props {
  booking: any;
  balanceLink: string | null;
  linkExpiresAt: number | null;
  generatingLink: boolean;
  sendingEmail: boolean;
  emailSent: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onSendEmail: () => void;
}

const formatExpiry = (ts: number) =>
  new Date(ts * 1000).toLocaleString("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const BookingPaymentLinkCard = ({
  booking, balanceLink, linkExpiresAt, generatingLink, sendingEmail, emailSent,
  onGenerate, onRegenerate, onSendEmail,
}: Props) => {
  const isNewBookingLink = booking.status === "pending" && booking.amount_paid === 0;
  const isExpired = linkExpiresAt ? Date.now() / 1000 > linkExpiresAt : false;
  const remaining = Math.round((booking.total_price - booking.amount_paid) * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.46 }}
      className="bg-white border-2 border-primary/30 rounded-sm shadow-sm px-6 py-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold text-foreground">
            {isNewBookingLink
              ? (booking.payment_type === "full" ? "Link pagamento totale" : "Link caparra prenotazione")
              : "Saldo prenotazione"}
          </h3>
          <p className="font-sans text-xs text-muted-foreground">
            {isNewBookingLink
              ? `Link Stripe da inviare al cliente per ${booking.payment_type === "full" ? "saldare l'intero importo" : "versare la caparra"} di €${booking.payment_type === "full" ? booking.total_price : Math.round(booking.total_price * DEPOSIT_RATE * 100) / 100}`
              : `Genera un link di pagamento Stripe da inviare al cliente per saldare €${remaining}`}
          </p>
        </div>
      </div>

      {balanceLink ? (
        <div className="space-y-3">
          {isExpired ? (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="font-sans text-xs font-semibold text-destructive">Link scaduto</p>
                <p className="font-sans text-[10px] text-destructive/80">
                  Il link di pagamento è scaduto il {formatExpiry(linkExpiresAt!)}. È necessario rigenerarne uno nuovo.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-secondary/50 border border-border/60 rounded-sm">
                <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={balanceLink}
                  className="flex-1 bg-transparent text-xs font-mono text-foreground border-none outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(balanceLink);
                    toast({ title: "Link copiato!", description: "Puoi inviarlo al cliente." });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-sm hover:bg-primary/90 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copia
                </button>
              </div>

              {linkExpiresAt && (
                <p className="font-sans text-[10px] text-muted-foreground">
                  Il link scade il {formatExpiry(linkExpiresAt)}. 
                  Dopo la scadenza sarà necessario generarne uno nuovo.
                </p>
              )}
            </>
          )}

          <div className="flex gap-2">
            {!isExpired && (
              !emailSent ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={sendingEmail}
                  onClick={onSendEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-sans text-xs font-semibold uppercase tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Invia email automatica
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans text-xs font-semibold uppercase tracking-wide rounded-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Email inviata a {booking.guest_email}
                </div>
              )
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={generatingLink}
              onClick={onRegenerate}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wide rounded-sm transition-colors disabled:opacity-50 ${
                isExpired
                  ? "flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border text-foreground hover:bg-secondary/50"
              }`}
            >
              {generatingLink ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  {isExpired ? "Genera nuovo link" : "Rigenera"}
                </>
              )}
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={generatingLink}
          onClick={onGenerate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-sans text-sm font-semibold uppercase tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {generatingLink ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generazione in corso...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              SALDA PRENOTAZIONE
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default BookingPaymentLinkCard;
