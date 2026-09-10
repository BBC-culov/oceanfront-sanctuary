import { motion } from "framer-motion";
import { Building2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getStatusConfig } from "@/lib/bookingStatus";

interface BookingHeroCardProps {
  booking: any;
  apartment: any;
  nights: number;
}

const BookingHeroCard = ({ booking, apartment, nights }: BookingHeroCardProps) => {
  const status = getStatusConfig(booking.status);
  const StatusIcon = status.icon;
  const coverImg = apartment?.images?.[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
    >
      {coverImg && (
        <div className="relative h-44 sm:h-56 overflow-hidden">
          <img
            src={coverImg}
            alt={apartment?.name || "Appartamento"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="font-serif text-xl sm:text-2xl text-white drop-shadow-lg">
              {apartment?.name || "Appartamento"}
            </p>
            {apartment?.address && (
              <p className="font-sans text-xs text-white/80 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {apartment.address}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="p-5">
        {!coverImg && (
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl text-foreground">{apartment?.name || "Appartamento"}</h1>
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} ${status.text} border ${status.border}`}>
            <StatusIcon className="w-4 h-4" strokeWidth={2} />
            <span className="font-sans text-sm font-medium">{status.label}</span>
          </div>
          {booking.booking_code && (
            <span className="font-mono text-xs tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              #{booking.booking_code}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Check-in</p>
            <p className="font-sans text-sm font-medium text-foreground">
              {format(new Date(booking.check_in), "d MMMM yyyy", { locale: it })}
            </p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Check-out</p>
            <p className="font-sans text-sm font-medium text-foreground">
              {format(new Date(booking.check_out), "d MMMM yyyy", { locale: it })}
            </p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Durata</p>
            <p className="font-sans text-sm font-medium text-foreground">{nights} notti</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingHeroCard;
