import { motion } from "framer-motion";
import { PlaneTakeoff, PlaneLanding, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdditionalServices, type AdditionalService } from "@/hooks/useAdditionalServices";

export interface FlightData {
  flight_outbound: string;
  flight_return: string;
  arrival_time: string;
  departure_time: string;
}

interface StepFlightServicesProps {
  flightData: FlightData;
  setFlightData: (d: FlightData) => void;
  selectedServices: string[];
  setSelectedServices: (s: string[]) => void;
  notes: string;
  setNotes: (n: string) => void;
  nights: number;
}

const fieldAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const StepFlightServices = ({
  flightData,
  setFlightData,
  selectedServices,
  setSelectedServices,
  notes,
  setNotes,
  nights,
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10"
    >
      {/* Flight info */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <PlaneTakeoff className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-light text-foreground">Informazioni volo</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div {...fieldAnim} className="space-y-1.5">
            <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground flex items-center gap-2">
              <PlaneTakeoff className="w-3 h-3" /> Volo andata
            </label>
            <Input
              value={flightData.flight_outbound}
              onChange={(e) => updateFlight("flight_outbound", e.target.value)}
              placeholder="es. TAP 1234"
              className="bg-background border-border font-sans text-sm"
            />
          </motion.div>
          <motion.div {...fieldAnim} className="space-y-1.5">
            <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
              Orario arrivo stimato
            </label>
            <Input
              type="time"
              value={flightData.arrival_time}
              onChange={(e) => updateFlight("arrival_time", e.target.value)}
              className="bg-background border-border font-sans text-sm"
            />
          </motion.div>
          <motion.div {...fieldAnim} className="space-y-1.5">
            <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground flex items-center gap-2">
              <PlaneLanding className="w-3 h-3" /> Volo ritorno
            </label>
            <Input
              value={flightData.flight_return}
              onChange={(e) => updateFlight("flight_return", e.target.value)}
              placeholder="es. TAP 4321"
              className="bg-background border-border font-sans text-sm"
            />
          </motion.div>
          <motion.div {...fieldAnim} className="space-y-1.5">
            <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
              Orario partenza stimato
            </label>
            <Input
              type="time"
              value={flightData.departure_time}
              onChange={(e) => updateFlight("departure_time", e.target.value)}
              className="bg-background border-border font-sans text-sm"
            />
          </motion.div>
        </div>
      </div>

      {/* Additional services */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-light text-foreground">Servizi aggiuntivi</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service, i) => {
            const isSelected = selectedServices.includes(service.id);
            const total = getServiceTotal(service);

            return (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleService(service.id)}
                className={`group relative p-4 border text-left transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-foreground">{service.name}</p>
                    {service.description && (
                      <p className="font-sans text-xs text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-sans text-sm font-semibold text-foreground">€{total}</p>
                    {total !== service.price && (
                      <p className="font-sans text-[10px] text-muted-foreground">
                        €{service.price}/giorno
                      </p>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                <motion.div
                  initial={false}
                  animate={{ scale: isSelected ? 1 : 0 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
          Note aggiuntive (facoltativo)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Richieste particolari, esigenze alimentari, orari preferiti..."
          className="bg-background border-border font-sans text-sm min-h-[100px] resize-none"
        />
      </div>
    </motion.div>
  );
};

export default StepFlightServices;
