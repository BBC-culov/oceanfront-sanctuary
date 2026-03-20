import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface BillingData {
  billing_name: string;
  billing_address: string;
  billing_city: string;
  billing_zip: string;
  billing_country: string;
  billing_fiscal_code: string;
}

interface StepBillingProps {
  billing: BillingData;
  setBilling: (b: BillingData) => void;
}

const fieldAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const LabeledInput = ({
  label,
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <motion.div {...fieldAnim} className="space-y-1.5">
    <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="bg-background border-border font-sans text-sm"
    />
  </motion.div>
);

const StepBilling = ({ billing, setBilling }: StepBillingProps) => {
  const update = (field: keyof BillingData, value: string) => {
    setBilling({ ...billing, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Receipt className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-serif text-xl font-light text-foreground">Dati di fatturazione</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <LabeledInput label="Intestatario" value={billing.billing_name} onChange={(v) => update("billing_name", v)} placeholder="Mario Rossi / Azienda SRL" />
        </div>
        <LabeledInput label="Codice fiscale / P.IVA" value={billing.billing_fiscal_code} onChange={(v) => update("billing_fiscal_code", v)} placeholder="RSSMRA85M01H501Z" />
        <LabeledInput label="Paese" value={billing.billing_country} onChange={(v) => update("billing_country", v)} placeholder="Italia" />
        <div className="sm:col-span-2">
          <LabeledInput label="Indirizzo" value={billing.billing_address} onChange={(v) => update("billing_address", v)} placeholder="Via Roma 1" />
        </div>
        <LabeledInput label="Città" value={billing.billing_city} onChange={(v) => update("billing_city", v)} placeholder="Roma" />
        <LabeledInput label="CAP" value={billing.billing_zip} onChange={(v) => update("billing_zip", v)} placeholder="00100" />
      </div>
    </motion.div>
  );
};

export default StepBilling;
