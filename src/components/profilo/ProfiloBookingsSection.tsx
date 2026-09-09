import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Calendar, CalendarCheck, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { countNights } from "@/lib/nights";
import { getStatusConfig } from "@/lib/bookingStatus";
import type { RealBooking } from "@/hooks/useProfiloData";
import { AnimatedSection } from "./ProfiloUi";

interface ProfiloBookingsSectionProps {
  bookings: RealBooking[];
  loading: boolean;
}

const ProfiloBookingsSection = ({ bookings, loading }: ProfiloBookingsSectionProps) => (
  <AnimatedSection delay={0.3} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
      <motion.div
        whileHover={{ rotate: -10, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Calendar className="w-4 h-4 text-primary" />
      </motion.div>
      <h2 className="font-serif text-xl text-foreground">Gestisci Prenotazioni</h2>
    </div>

    <div className="p-6">
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Calendar className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
          </motion.div>
          <p className="font-sans text-muted-foreground text-sm mb-1">Nessuna prenotazione</p>
          <p className="font-sans text-muted-foreground/60 text-xs">Le tue prenotazioni appariranno qui</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, idx) => {
            const status = getStatusConfig(booking.status);
            const nights = countNights(booking.check_in, booking.check_out);
            return (
              <Link to={`/prenotazione/${booking.id}`} key={booking.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                  whileHover={{ x: 4, boxShadow: "0 4px 15px -3px hsl(var(--primary) / 0.1)" }}
                  className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {booking.booking_code && (
                        <span className="font-mono text-[10px] tracking-wider text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-full">
                          #{booking.booking_code}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      {booking.total_price && (
                        <span className="text-xs font-sans font-semibold text-foreground">€{booking.total_price}</span>
                      )}
                    </div>
                    <p className="font-sans text-sm text-foreground font-medium flex items-center gap-1.5">
                      <Building2 size={13} className="text-muted-foreground" />
                      {booking.apartment_name || "Appartamento"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                        <CalendarCheck size={11} />
                        {format(new Date(booking.check_in), "d MMM", { locale: it })} → {format(new Date(booking.check_out), "d MMM yyyy", { locale: it })}
                      </span>
                      <span className="text-xs text-muted-foreground font-sans">
                        {nights} notti
                      </span>
                    </div>
                  </div>
                  <motion.div
                    className="ml-4 p-2 rounded-lg text-muted-foreground group-hover:text-primary transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  </AnimatedSection>
);

export default ProfiloBookingsSection;
