import { motion } from "framer-motion";
import { PlaneTakeoff, PlaneLanding, Sparkles, Clock, Building2, Check, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdditionalServices, type AdditionalService } from "@/hooks/useAdditionalServices";

export interface FlightData {
  flight_outbound: string;
  flight_return: string;
  arrival_time: string;
  departure_time: string;
  airline: string;
}

interface StepFlightServicesProps {
  flightData: FlightData;
  setFlightData: (d: FlightData) => void;
  selectedServices: string[];
  setSelectedServices: (s: string[]) => void;
  notes: string;
  setNotes: (n: string) => void;
  nights: number;
  noTransfer: boolean;
  setNoTransfer: (v: boolean) => void;
  errors?: Record<string, boolean>;
}

const FloatingInput = ({
  label, value, onChange, type = "text", placeholder, icon: Icon, delay = 0, error = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ElementType; delay?: number; error?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <label className="flex items-center gap-1.5 font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5">
      {Icon && <Icon className="w-3 h-3" strokeWidth={1.5} />}
      {label}
      <span className="text-primary/70">*</span>
    </label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-card/50 font-sans text-sm h-11 focus:border-primary/40 focus:bg-background transition-all duration-200 ${
        error ? "border-destructive/70 bg-destructive/5" : "border-border/60"
      }`}
    />
    {error && (
      <p className="font-sans text-[10px] text-destructive mt-1">Campo obbligatorio</p>
    )}
  </motion.div>
);

const StepFlightServices = ({
  flightData, setFlightData, selectedServices, setSelectedServices, notes, setNotes, nights,
  noTransfer, setNoTransfer, errors = {},
}: StepFlightServicesProps) => {
  const { data: services = [] } = useAdditionalServices();

  const updateFlight = (field: keyof FlightData, value: string) => {
    setFlightData({ ...flightData, [field]: value });
  };

  const toggleService = (id: string) => {
    setSelectedServices(
      selectedServices.includes(id)
        ? selectedServices.filter((s) => s !== id)
        : [...selectedServices, id]
    );
  };

  const getServiceTotal = (service: AdditionalService) => {
    if (service.name.toLowerCase().includes("noleggio") || service.name.toLowerCase().includes("giorno")) {
      return service.price * nights;
    }
    return service.price;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Flight info card */}
      <motion.div
        id="flight-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card/40 border border-border/50 p-6 sm:p-7 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center">
            <PlaneTakeoff className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-lg text-foreground">Informazioni di viaggio</h3>
        </div>

        {/* Info banner about included transfer */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="flex items-start gap-3 p-4 border border-primary/20 bg-primary/[0.04] rounded-sm"
        >
          <PlaneTakeoff className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <p className="font-sans text-[12px] text-foreground/80 leading-relaxed">
            Tutti i nostri appartamenti includono il <span className="font-medium text-foreground">servizio di trasporto andata e ritorno</span> dall'appartamento all'aeroporto e viceversa. Inserisci le informazioni del tuo volo per organizzare il trasferimento.
          </p>
        </motion.div>

        {/* Flight fields — shown only if noTransfer is false */}
        {!noTransfer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Airline */}
            <FloatingInput
              label="Compagnia aerea"
              icon={Building2}
              value={flightData.airline}
              onChange={(v) => updateFlight("airline", v)}
              placeholder="es. TAP Portugal, Ryanair..."
              delay={0.05}
              error={errors.airline}
            />

            {/* Flights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Outbound */}
              <div className="space-y-3 p-4 bg-background/50 border border-border/30 rounded-sm">
                <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-primary font-medium flex items-center gap-1.5">
                  <PlaneTakeoff className="w-3 h-3" /> Andata
                </span>
                <FloatingInput
                  label="Numero volo"
                  value={flightData.flight_outbound}
                  onChange={(v) => updateFlight("flight_outbound", v)}
                  placeholder="es. TP 1234"
                  delay={0.1}
                  error={errors.flight_outbound}
                />
                <FloatingInput
                  label="Orario arrivo stimato"
                  icon={Clock}
                  value={flightData.arrival_time}
                  onChange={(v) => updateFlight("arrival_time", v)}
                  type="time"
                  delay={0.15}
                  error={errors.arrival_time}
                />
              </div>

              {/* Return */}
              <div className="space-y-3 p-4 bg-background/50 border border-border/30 rounded-sm">
                <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-primary font-medium flex items-center gap-1.5">
                  <PlaneLanding className="w-3 h-3" /> Ritorno
                </span>
                <FloatingInput
                  label="Numero volo"
                  value={flightData.flight_return}
                  onChange={(v) => updateFlight("flight_return", v)}
                  placeholder="es. TP 4321"
                  delay={0.2}
                  error={errors.flight_return}
                />
                <FloatingInput
                  label="Orario partenza stimato"
                  icon={Clock}
                  value={flightData.departure_time}
                  onChange={(v) => updateFlight("departure_time", v)}
                  type="time"
                  delay={0.25}
                  error={errors.departure_time}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* No transfer checkbox — at the bottom */}
        <motion.label
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex items-start gap-3 p-4 border border-border/40 bg-background/50 cursor-pointer hover:border-primary/30 transition-colors group"
        >
          <Checkbox
            checked={noTransfer}
            onCheckedChange={(checked) => setNoTransfer(checked === true)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Ban className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="font-sans text-sm font-medium text-foreground">
                Non voglio usufruire del servizio trasporto A/R Aeroporto
              </span>
            </div>
            <p className="font-sans text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Seleziona se non hai bisogno del trasferimento aeroportuale
            </p>
          </div>
        </motion.label>
      </motion.div>

      {/* Additional services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card/40 border border-border/50 p-6 sm:p-7 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center">
            <Sparkles className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-foreground">Servizi aggiuntivi</h3>
            <p className="font-sans text-[11px] text-muted-foreground mt-0.5">Seleziona per personalizzare il tuo soggiorno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service, i) => {
            const isSelected = selectedServices.includes(service.id);
            const total = getServiceTotal(service);

            return (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleService(service.id)}
                className={`relative text-left p-4 border transition-all duration-300 overflow-hidden group ${
                  isSelected
                    ? "border-primary/50 bg-primary/[0.06] shadow-sm"
                    : "border-border/40 hover:border-primary/25 bg-background/50 hover:bg-primary/[0.02]"
                }`}
              >
                <div className="absolute top-3 right-3 z-10">
                  <motion.div
                    initial={false}
                    animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                </div>

                <div className="pr-7">
                  <p className="font-sans text-sm font-medium text-foreground leading-snug">{service.name}</p>
                  {service.description && (
                    <p className="font-sans text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className={`font-sans text-base font-semibold transition-colors duration-200 ${isSelected ? "text-primary" : "text-foreground"}`}>
                    €{total}
                  </span>
                  {total !== service.price && (
                    <span className="font-sans text-[10px] text-muted-foreground">
                      (€{service.price}/giorno × {nights}n)
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card/40 border border-border/50 p-6 sm:p-7 space-y-3"
      >
        <label className="font-sans text-[11px] tracking-wide text-muted-foreground">
          Note aggiuntive <span className="text-muted-foreground/60">(facoltativo)</span>
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Richieste particolari, esigenze alimentari, orari preferiti..."
          className="bg-background/50 border-border/60 font-sans text-sm min-h-[90px] resize-none focus:border-primary/40 transition-all duration-200"
        />
      </motion.div>
    </motion.div>
  );
};

export default StepFlightServices;
