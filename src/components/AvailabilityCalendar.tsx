import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarCheck, Info } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth,
  isSameDay, isToday, isBefore, startOfDay, addDays,
} from "date-fns";
import { it } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityCalendarProps {
  apartmentSlug?: string;
  apartmentId?: string;
  onDateSelect?: (checkIn: Date | null, checkOut: Date | null) => void;
}

interface BookedRange {
  checkIn: Date;
  checkOut: Date;
}

const AvailabilityCalendar = ({ apartmentSlug, apartmentId, onDateSelect }: AvailabilityCalendarProps) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);

  const { data: bookedRanges = [] } = useQuery({
    queryKey: ["apartment-bookings", apartmentId],
    queryFn: async () => {
      if (!apartmentId) return [];
      const [bookingsRes, blocksRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("check_in, check_out")
          .eq("apartment_id", apartmentId)
          .in("status", ["confirmed", "pending", "awaiting_verification", "paid"]),
        supabase
          .from("apartment_availability_blocks")
          .select("start_date, end_date")
          .eq("apartment_id", apartmentId),
      ]);
      if (bookingsRes.error) throw bookingsRes.error;
      if (blocksRes.error) throw blocksRes.error;
      const bookings = (bookingsRes.data ?? []).map((b) => ({
        checkIn: startOfDay(new Date(b.check_in)),
        checkOut: startOfDay(new Date(b.check_out)),
      }));
      // Treat blocks as inclusive ranges → checkOut = end_date + 1
      const blocks = (blocksRes.data ?? []).map((b) => ({
        checkIn: startOfDay(new Date(b.start_date)),
        checkOut: addDays(startOfDay(new Date(b.end_date)), 1),
      }));
      return [...bookings, ...blocks] as BookedRange[];
    },
    enabled: !!apartmentId,
    staleTime: 5 * 60 * 1000,
  });

  const isDateBooked = (day: Date) =>
    bookedRanges.some((r) => day >= r.checkIn && day < r.checkOut);

  const nextAvailableDate = useMemo(() => {
    const start = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const d = addDays(start, i);
      if (!isDateBooked(d)) return d;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookedRanges]);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const goNext = () => { setDirection(1); setCurrentMonth((m) => addMonths(m, 1)); };
  const goPrev = () => { setDirection(-1); setCurrentMonth((m) => subMonths(m, 1)); };

  const rangeOverlapsBooking = (start: Date, end: Date) =>
    bookedRanges.some((r) => start < r.checkOut && end > r.checkIn);

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today) || isDateBooked(day)) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day); setCheckOut(null); onDateSelect?.(day, null);
    } else {
      if (isBefore(day, checkIn) || isSameDay(day, checkIn)) {
        setCheckIn(day); setCheckOut(null); onDateSelect?.(day, null);
      } else {
        if (rangeOverlapsBooking(checkIn, day)) {
          let lastAvailable = checkIn;
          for (let d = addDays(checkIn, 1); d <= day; d = addDays(d, 1)) {
            if (isDateBooked(d)) break;
            lastAvailable = d;
          }
          if (!isSameDay(lastAvailable, checkIn)) {
            setCheckOut(lastAvailable); onDateSelect?.(checkIn, lastAvailable);
          }
        } else {
          setCheckOut(day); onDateSelect?.(checkIn, day);
        }
      }
    }
  };

  const handleBooking = () => {
    if (!checkIn || !checkOut || !apartmentSlug) return;
    const params = new URLSearchParams({
      apt: apartmentSlug,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
    });
    navigate(`/prenota?${params.toString()}`);
  };

  const isInRange = (day: Date) => checkIn && checkOut && day > checkIn && day < checkOut;
  const isRangeStart = (day: Date) => checkIn && isSameDay(day, checkIn);
  const isRangeEnd = (day: Date) => checkOut && isSameDay(day, checkOut);
  const isPast = (day: Date) => isBefore(day, today);

  const monthVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const hasBookedDatesThisMonth = days.some((d) => isSameMonth(d, currentMonth) && isDateBooked(d));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55 }}
      className="bg-secondary p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <CalendarCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
        <h3 className="font-serif text-lg font-light text-foreground">Disponibilità</h3>
      </div>

      <div className="flex items-center justify-between">
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={goPrev} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div className="relative h-6 flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.p key={format(currentMonth, "yyyy-MM")} custom={direction} variants={monthVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeInOut" }} className="absolute inset-0 text-center font-sans text-sm font-medium tracking-wide capitalize text-foreground">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </motion.p>
          </AnimatePresence>
        </div>
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={goNext} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((d) => (
          <div key={d} className="text-center font-sans text-[10px] tracking-wider uppercase text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div key={format(currentMonth, "yyyy-MM")} custom={direction} variants={monthVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeInOut" }} className="grid grid-cols-7 gap-0">
          {days.map((day, i) => {
            const outside = !isSameMonth(day, currentMonth);
            const past = isPast(day);
            const booked = isDateBooked(day);
            const disabled = past || outside || booked;
            const selected = isRangeStart(day) || isRangeEnd(day);
            const inRange = isInRange(day);
            const todayDay = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.008 }}
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex justify-between font-sans text-xs text-muted-foreground">
                <span>Check-in</span>
                <span className="text-foreground font-medium">{format(checkIn, "d MMM yyyy", { locale: it })}</span>
              </div>
              {checkOut && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between font-sans text-xs text-muted-foreground">
                  <span>Check-out</span>
                  <span className="text-foreground font-medium">{format(checkOut, "d MMM yyyy", { locale: it })}</span>
                </motion.div>
              )}
              {checkIn && checkOut && (
                <>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-[10px] tracking-wider uppercase text-primary text-center pt-1">
                    {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} notti
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBooking}
                    className="w-full mt-3 font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-6 py-3.5 hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                  >
                    Prenota
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AvailabilityCalendar;