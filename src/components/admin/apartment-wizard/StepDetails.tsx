import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fieldLabel } from "./shared";
import { PRESET_SERVICES, type ApartmentForm } from "./types";

interface StepDetailsProps {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
  servicesInput: string;
  setServicesInput: (v: string) => void;
}

const StepDetails = ({ form, setForm, servicesInput, setServicesInput }: StepDetailsProps) => {
  const currentServices = servicesInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const togglePreset = (label: string) => {
    if (currentServices.includes(label)) {
      setServicesInput(currentServices.filter((s) => s !== label).join(", "));
    } else {
      setServicesInput([...currentServices, label].join(", "));
    }
  };

  return (
    <div className="space-y-5">
      {/* Preset services */}
      <div>
        <label className={fieldLabel}>Servizi rapidi</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {PRESET_SERVICES.map((preset, i) => {
            const isSelected = currentServices.includes(preset.label);
            const Icon = preset.icon;
            return (
              <motion.button
                key={preset.label}
                type="button"
                onClick={() => togglePreset(preset.label)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                <Icon className="w-3 h-3" />
                {preset.label}
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-3 h-3" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom services input */}
      <div>
        <label className={fieldLabel}>Servizi personalizzati (separati da virgola)</label>
        <Input value={servicesInput} onChange={(e) => setServicesInput(e.target.value)} placeholder="Wi-Fi, Aria condizionata, Smart TV..." />
        {currentServices.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-sans text-[10px] text-primary mt-1.5"
          >
            {currentServices.length} servizi selezionati
          </motion.p>
        )}
      </div>

      {/* Publish toggle */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <label className={fieldLabel}>Pubblicare subito?</label>
        <motion.button
          type="button"
          onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-muted"}`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm"
            animate={{ left: form.is_active ? "calc(100% - 20px)" : "4px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
        <motion.span
          className="font-sans text-sm"
          animate={{ color: form.is_active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
        >
          {form.is_active ? "Sì, attivo" : "No, bozza"}
        </motion.span>
      </div>
    </div>
  );
};

export default StepDetails;
