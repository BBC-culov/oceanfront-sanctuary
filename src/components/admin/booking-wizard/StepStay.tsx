import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, CalendarDays, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";

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

interface Props {
  value: StayData;
  onChange: (v: StayData) => void;
}

const StepStay = ({ value, onChange }: Props) => {
  const [apartments, setApartments] = useState<ApartmentLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyDates, setBusyDates] = useState<{ check_in: string; check_out: string }[]>([]);

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
    if (!value.apartment_id) {
      setBusyDates([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("check_in, check_out, status")
        .eq("apartment_id", value.apartment_id)
        .in("status", ["pending", "confirmed"]);
      setBusyDates((data ?? []) as any[]);
    })();
  }, [value.apartment_id]);

  const selectedApt = apartments.find((a) => a.id === value.apartment_id);
  const nights =
    value.check_in && value.check_out
      ? Math.max(0, differenceInDays(parseISO(value.check_out), parseISO(value.check_in)))
      : 0;

  // Detect overlap with existing busy dates
  const overlap =
    value.check_in && value.check_out && nights > 0
      ? busyDates.some(
          (b) =>
            parseISO(b.check_in) < parseISO(value.check_out) &&
            parseISO(b.check_out) > parseISO(value.check_in),
        )
      : false;

  const today = new Date().toISOString().split("T")[0];

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
              onChange={(e) => onChange({ ...value, apartment_id: e.target.value })}
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="font-sans text-xs">Check-in *</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              min={today}
              value={value.check_in}
              onChange={(e) => onChange({ ...value, check_in: e.target.value })}
              className="pl-9 font-sans"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-xs">Check-out *</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              min={value.check_in || today}
              value={value.check_out}
              onChange={(e) => onChange({ ...value, check_out: e.target.value })}
              className="pl-9 font-sans"
            />
          </div>
        </div>
      </div>

      {selectedApt && nights > 0 && (
        <div className={`p-4 border ${overlap ? "border-destructive/50 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
          {overlap ? (
            <p className="font-sans text-sm text-destructive">
              ⚠️ Le date selezionate sono in conflitto con un'altra prenotazione. Scegli un altro intervallo.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3 text-sm font-sans">
              <span className="text-muted-foreground">
                {nights} {nights === 1 ? "notte" : "notti"} a €{selectedApt.price_per_night}/notte
              </span>
              <span className="text-foreground font-medium">
                €{(selectedApt.price_per_night * nights).toFixed(2)} alloggio
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StepStay;
