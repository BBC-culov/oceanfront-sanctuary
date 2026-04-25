import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ChevronLeft, ChevronRight, CalendarCheck, Info, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, isBefore, startOfDay, addDays, differenceInDays, parseISO,
} from "date-fns";
import { it } from "date-fns/locale";

export interface StayData {
  apartment_id: string;
  check_in: string;  // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
}

interface ApartmentLite {
  id: string;
  name: string;
  price_per_night: number;
  guests: number;
  is_active: boolean;
}

interface BookedRange { checkIn: Date; checkOut: Date; }

interface Props {
  value: StayData;
  onChange: (v: StayData) => void;
}

const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const toIso = (d: Date) => format(d, "yyyy-MM-dd");

const StepStay = ({ value, onChange }: Props) => {
  const [apartments, setApartments] = useState<ApartmentLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("apartments")
        .select("id, name, price_per_night, guests, is_active")
        .eq("is_active", true)
        .order("name");
      setApartments((data ?? []) as ApartmentLite[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!value.apartment_id) { setBookedRanges([]); return; }
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("check_in, check_out")
        .eq("apartment_id", value.apartment_id)
        .in("status", ["pending", "confirmed", "awaiting_verification", "paid"]);
      setBookedRanges(
        (data ?? []).map((b: any) => ({
          checkIn: startOfDay(new Date(b.check_in)),
          checkOut: startOfDay(new Date(b.check_out)),
        })),
      );
    })();
  }, [value.apartment_id]);

  const selectedApt = apartments.find((a) => a.id === value.apartment_id);
  const checkIn = value.check_in ? parseISO(value.check_in) : null;
  const checkOut = value.check_out ? parseISO(value.check_out) : null;
  const nights = checkIn && checkOut ? Math.max(0, differenceInDays(checkOut, checkIn)) : 0;

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isDateBooked = (day: Date) =>
    bookedRanges.some((r) => day >= r.checkIn && day < r.checkOut);

  const rangeOverlapsBooking = (start: Date, end: Date) =>
    bookedRanges.some((r) => start < r.checkOut && end > r.checkIn);

  const nextAvailableDate = useMemo(() => {
    const start = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const d = addDays(start, i);
      if (!isDateBooked(d)) return d;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookedRanges]);

  const goNext = () => { setDirection(1); setCurrentMonth((m) => addMonths(m, 1)); };
  const goPrev = () => { setDirection(-1); setCurrentMonth((m) => subMonths(m, 1)); };

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today) || isDateBooked(day)) return;
    if (!checkIn || (checkIn && checkOut)) {
      onChange({ ...value, check_in: toIso(day), check_out: "" });
    } else {
      if (isBefore(day, checkIn) || isSameDay(day, checkIn)) {
        onChange({ ...value, check_in: toIso(day), check_out: "" });
      } else if (rangeOverlapsBooking(checkIn, day)) {
        let lastAvailable = checkIn;
        for (let d = addDays(checkIn, 1); d <= day; d = addDays(d, 1)) {
          if (isDateBooked(d)) break;
          lastAvailable = d;
        }
        if (!isSameDay(lastAvailable, checkIn)) {
          onChange({ ...value, check_out: toIso(lastAvailable) });
        }
      } else {
        onChange({ ...value, check_out: toIso(day) });
      }
    }
  };

  const isInRange = (day: Date) => checkIn && checkOut && day > checkIn && day < checkOut;
  const isRangeStart = (day: Date) => checkIn && isSameDay(day, checkIn);
  const isRangeEnd = (day: Date) => checkOut && isSameDay(day, checkOut);

  const monthVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const hasBookedDatesThisMonth = days.some((d) => isSameMonth(d, currentMonth) && isDateBooked(d));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h3 className="font-serif text-xl text-foreground mb-1">Soggiorno</h3>
        <p className="font-sans text-sm text-muted-foreground">
          Scegli appartamento e date del soggiorno.
        </p>
      </div>

      {/* Apartment selector */}
      <div className="space-y-1.5">
        <Label className="font-sans text-xs">Appartamento *</Label>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Caricamento...
          </div>
        ) : (
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={value.apartment_id}
              onChange={(e) => onChange({ apartment_id: e.target.value, check_in: "", check_out: "" })}
              className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm font-sans appearance-none"
            >
              <option value="">Seleziona un appartamento...</option>
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — €{a.price_per_night}/notte · max {a.guests} ospiti
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Availability calendar (only when apartment is selected) */}
      {value.apartment_id && (
        <div className="bg-secondary p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <CalendarCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h3 className="font-serif text-lg font-light text-foreground">Disponibilità</h3>
          </div>

          <div className="flex items-center justify-between">
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <div className="relative h-6 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.p
                  key={format(currentMonth, "yyyy-MM")}
                  custom={direction} variants={monthVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 text-center font-sans text-sm font-medium tracking-wide capitalize text-foreground"
                >
                  {format(currentMonth, "MMMM yyyy", { locale: it })}
                </motion.p>
              </AnimatePresence>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-7 gap-0">
            {weekDays.map((d) => (
              <div key={d} className="text-center font-sans text-[10px] tracking-wider uppercase text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={format(currentMonth, "yyyy-MM")}
              custom={direction} variants={monthVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="grid grid-cols-7 gap-0"
            >
              {days.map((day, i) => {
                const outside = !isSameMonth(day, currentMonth);
                const past = isBefore(day, today);
                const booked = isDateBooked(day);
                const disabled = past || outside || booked;
                const selected = isRangeStart(day) || isRangeEnd(day);
                const inRange = isInRange(day);
                const todayDay = isToday(day);

                return (
                  <motion.button
                    type="button"
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.006 }}
                    onClick={() => !disabled && handleDayClick(day)}
                    disabled={disabled}
                    className={`
                      relative h-9 w-full font-sans text-xs transition-all duration-200
                      ${outside ? "text-transparent pointer-events-none" : ""}
                      ${past && !outside ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                      ${booked && !outside ? "text-muted-foreground/40 cursor-not-allowed line-through decoration-destructive/50" : ""}
                      ${!disabled && !selected ? "text-foreground hover:bg-primary/10 cursor-pointer" : ""}
                      ${selected ? "bg-primary text-primary-foreground font-medium z-10" : ""}
                      ${inRange ? "bg-primary/15 text-foreground" : ""}
                      ${todayDay && !selected ? "font-semibold" : ""}
                      ${isRangeStart(day) && checkOut ? "rounded-l-md" : ""}
                      ${isRangeEnd(day) ? "rounded-r-md" : ""}
                      ${selected && !checkOut ? "rounded-md" : ""}
                    `}
                  >
                    {format(day, "d")}
                    {todayDay && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {hasBookedDatesThisMonth && (
            <div className="flex items-center gap-2 text-[10px] font-sans text-muted-foreground">
              <span className="line-through decoration-destructive/50">00</span>
              <span>= non disponibile</span>
            </div>
          )}

          {bookedRanges.length > 0 && nextAvailableDate && !checkIn && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 bg-primary/5 rounded-md"
            >
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="font-sans text-xs text-muted-foreground">
                Prossima data disponibile: <span className="text-foreground font-medium">{format(nextAvailableDate, "d MMMM yyyy", { locale: it })}</span>
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {checkIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between font-sans text-xs text-muted-foreground">
                    <span>Check-in</span>
                    <span className="text-foreground font-medium">{format(checkIn, "d MMM yyyy", { locale: it })}</span>
                  </div>
                  {checkOut && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between font-sans text-xs text-muted-foreground"
                    >
                      <span>Check-out</span>
                      <span className="text-foreground font-medium">{format(checkOut, "d MMM yyyy", { locale: it })}</span>
                    </motion.div>
                  )}
                  {checkIn && checkOut && selectedApt && (
                    <div className="flex justify-between items-baseline pt-2 border-t border-border/60">
                      <span className="font-sans text-[10px] tracking-wider uppercase text-primary">
                        {nights} {nights === 1 ? "notte" : "notti"}
                      </span>
                      <span className="font-sans text-sm font-medium text-foreground">
                        €{(selectedApt.price_per_night * nights).toFixed(2)} alloggio
                      </span>
                    </div>
                  )}
                  {checkIn && !checkOut && (
                    <p className="font-sans text-[11px] text-muted-foreground italic pt-1">
                      Seleziona ora la data di check-out sul calendario.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default StepStay;
