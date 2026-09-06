import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { countNights } from "@/lib/nights";
import {
  ArrowLeft, CalendarCheck, CheckCircle2, Building2, ChevronRight, Pencil,
} from "lucide-react";
import { BOOKING_STATUS, getStatusConfig } from "@/lib/bookingStatus";
import RecordManualPaymentDialog from "@/components/admin/RecordManualPaymentDialog";
import ModificationRequestsPanel from "@/components/admin/ModificationRequestsPanel";
import AdminEditBookingDialog from "@/components/admin/AdminEditBookingDialog";
import BookingInfoGrid from "@/components/admin/booking-detail/BookingInfoGrid";
import BookingPaymentLinkCard from "@/components/admin/booking-detail/BookingPaymentLinkCard";
import ManualPaymentsCard from "@/components/admin/booking-detail/ManualPaymentsCard";
import { useAdminBookingDetail } from "@/hooks/useAdminBookingDetail";

const AdminPrenotazioneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const {
    booking, apartment, guests, manualPayments, loading,
    reload, updateStatus,
    balanceLink, linkExpiresAt, generatingLink, sendingEmail, emailSent,
    generateLink, regenerateLink, sendLinkEmail,
  } = useAdminBookingDetail(id, () => navigate("/admin/prenotazioni"));

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 w-48 bg-muted/40 animate-pulse rounded-sm" />
        <div className="h-40 bg-muted/40 animate-pulse rounded-sm" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-muted/40 animate-pulse rounded-sm" />
          <div className="h-64 bg-muted/40 animate-pulse rounded-sm" />
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const nights = countNights(booking.check_in, booking.check_out);
  const sc = getStatusConfig(booking.status);
  const StatusIcon = sc.icon;
  const aptImage = apartment?.images?.[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 max-w-4xl"
    >
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/admin/prenotazioni")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Torna alle prenotazioni
      </motion.button>

      {/* Hero header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-border rounded-sm shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          {aptImage && (
            <img src={aptImage} alt={apartment?.name} className="w-full sm:w-48 h-36 sm:h-auto object-cover flex-shrink-0" />
          )}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Prenotazione <span className="font-semibold text-foreground/80">#{booking.booking_code}</span>
                </p>
                <h1 className="font-serif text-2xl text-foreground mt-1 leading-tight">
                  {booking.guest_name} {booking.guest_last_name || ""}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="font-sans text-sm">{apartment?.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <CalendarCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="font-sans text-sm">
                    {format(new Date(booking.check_in), "d MMM", { locale: it })}
                    <ChevronRight className="w-3 h-3 inline mx-0.5" />
                    {format(new Date(booking.check_out), "d MMM yyyy", { locale: it })}
                    <span className="text-primary font-medium ml-1.5">({nights} notti)</span>
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border ${sc.bg} ${sc.border}`}>
                <StatusIcon className={`w-4 h-4 ${sc.text}`} strokeWidth={1.5} />
                <span className={`font-sans text-xs tracking-wide uppercase font-semibold ${sc.text}`}>{sc.label}</span>
              </div>
            </div>

            {/* Status actions */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50 flex-wrap">
              <span className="font-sans text-[10px] tracking-wide uppercase text-muted-foreground mr-1">Stato:</span>
              <p className="font-sans text-xs text-muted-foreground italic flex-1">{sc.description}</p>
              <select
                value={booking.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="h-8 rounded-sm border border-border/60 bg-white px-2.5 text-[11px] font-sans cursor-pointer hover:border-primary/50 transition-colors"
              >
                {Object.entries(BOOKING_STATUS).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditOpen(true)}
                className="font-sans text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-sm border border-primary/40 text-primary font-semibold hover:bg-primary/5 transition-colors flex items-center gap-1.5"
              >
                <Pencil className="w-3 h-3" />
                Modifica
              </motion.button>
              {booking.status === "awaiting_verification" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateStatus("confirmed")}
                  className="font-sans text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-sm bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Conferma pagamento
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modification requests panel */}
      <ModificationRequestsPanel
        bookingId={booking.id}
        originalStatus={booking.status === "modification_pending" ? "confirmed" : booking.status}
        onChanged={reload}
      />

      {/* Guest / flight / billing / services / notes */}
      <BookingInfoGrid booking={booking} guests={guests} />

      {/* Total + Payment status */}
      {booking.total_price && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="bg-white border border-border rounded-sm shadow-sm px-6 py-5 space-y-4"
        >
          <div className="flex justify-between items-baseline">
            <span className="font-sans text-sm font-semibold text-foreground tracking-wide uppercase">Totale</span>
            <span className="font-serif text-3xl text-primary">€{booking.total_price}</span>
          </div>

          {/* Payment details */}
          {booking.amount_paid > 0 && (
            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm text-muted-foreground">Caparra versata</span>
                <span className="font-sans text-sm font-medium text-emerald-600">€{booking.amount_paid}</span>
              </div>
              {booking.amount_paid >= booking.total_price ? (
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-sans text-sm font-bold text-emerald-700 uppercase tracking-wide">Prenotazione saldata</span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm font-semibold text-foreground">Saldo rimanente</span>
                  <span className="font-sans text-sm font-semibold text-amber-600">
                    €{Math.round((booking.total_price - booking.amount_paid) * 100) / 100}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Generate / show payment link — for confirmed (balance) or pending (manual booking with deposit/full link) */}
      {booking.total_price && booking.amount_paid < booking.total_price && booking.status !== "cancelled" && (
        <BookingPaymentLinkCard
          booking={booking}
          balanceLink={balanceLink}
          linkExpiresAt={linkExpiresAt}
          generatingLink={generatingLink}
          sendingEmail={sendingEmail}
          emailSent={emailSent}
          onGenerate={generateLink}
          onRegenerate={regenerateLink}
          onSendEmail={sendLinkEmail}
        />
      )}

      {/* Manual offline payments */}
      {booking.total_price && booking.status !== "cancelled" && (
        <ManualPaymentsCard
          booking={booking}
          manualPayments={manualPayments}
          onAdd={() => setPaymentDialogOpen(true)}
        />
      )}

      <RecordManualPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        bookingId={booking.id}
        totalPrice={booking.total_price ?? 0}
        amountPaid={booking.amount_paid ?? 0}
        onRecorded={reload}
      />

      <AdminEditBookingDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={booking}
        onSaved={reload}
      />

      {/* Meta */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="font-sans text-[10px] text-muted-foreground/40 text-center pb-4"
      >
        Creata il {format(new Date(booking.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
      </motion.p>
    </motion.div>
  );
};

export default AdminPrenotazioneDetail;
