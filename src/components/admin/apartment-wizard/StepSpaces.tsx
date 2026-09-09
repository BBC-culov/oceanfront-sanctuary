import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { fieldLabel, FieldError } from "./shared";
import type { ApartmentForm, ValidationErrors } from "./types";

interface StepSpacesProps {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
  errors: ValidationErrors;
}

const numericFields = [
  { label: "Prezzo / notte (€)", key: "price_per_night" as const, min: 0 },
  { label: "Ospiti max", key: "guests" as const, min: 1 },
  { label: "Camere da letto", key: "bedrooms" as const, min: 1 },
  { label: "Bagni", key: "bathrooms" as const, min: 1 },
  { label: "Superficie (mq)", key: "sqm" as const, min: 1 },
];

const StepSpaces = ({ form, setForm, errors }: StepSpacesProps) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {numericFields.map((f, i) => (
        <motion.div
          key={f.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <label className={fieldLabel}>{f.label} *</label>
          <Input
            type="number"
            min={f.min}
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
            className={errors[f.key] ? "border-destructive" : ""}
          />
          <FieldError message={errors[f.key]} />
        </motion.div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className={fieldLabel}>Orario Check-in *</label>
        <Input
          type="time"
          value={form.check_in_time}
          onChange={(e) => setForm({ ...form, check_in_time: e.target.value })}
          className={errors.check_in_time ? "border-destructive" : ""}
        />
        <FieldError message={errors.check_in_time} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <label className={fieldLabel}>Orario Check-out *</label>
        <Input
          type="time"
          value={form.check_out_time}
          onChange={(e) => setForm({ ...form, check_out_time: e.target.value })}
          className={errors.check_out_time ? "border-destructive" : ""}
        />
        <FieldError message={errors.check_out_time} />
      </motion.div>
    </div>
  </div>
);

export default StepSpaces;
