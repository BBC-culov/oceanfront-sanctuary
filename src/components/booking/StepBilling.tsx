import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { onlyDigits, onlyAlphanumeric } from "@/lib/bookingValidation";

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

const FloatingInput = ({
  label, value, onChange, placeholder, required = true, delay = 0, span2 = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; delay?: number; span2?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    className={span2 ? "sm:col-span-2" : ""}
  >
    <label className="block font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5">
      {label} {required && <span className="text-primary/70">*</span>}
    </label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="bg-card/50 border-border/60 font-sans text-sm h-11 focus:border-primary/40 focus:bg-background transition-all duration-200"
    />
  </motion.div>
);

const StepBilling = ({ billing, setBilling }: StepBillingProps) => {
  const update = (field: keyof BillingData, value: string) => {
    setBilling({ ...billing, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card/40 border border-border/50 p-6 sm:p-7 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center">
            <Receipt className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-foreground">Dati di fatturazione</h3>
            <p className="font-sans text-[11px] text-muted-foreground mt-0.5">Per la fattura del soggiorno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
          <FloatingInput span2 label="Intestatario" value={billing.billing_name} onChange={(v) => update("billing_name", v)} placeholder="Mario Rossi / Azienda SRL" delay={0.05} />
          <FloatingInput label="Codice Fiscale / P.IVA" value={billing.billing_fiscal_code} onChange={(v) => update("billing_fiscal_code", onlyAlphanumeric(v).toUpperCase())} placeholder="RSSMRA85M01H501Z" delay={0.08} />
          <FloatingInput label="Paese" value={billing.billing_country} onChange={(v) => update("billing_country", v)} placeholder="Italia" delay={0.11} />
          <FloatingInput span2 label="Indirizzo" value={billing.billing_address} onChange={(v) => update("billing_address", v)} placeholder="Via Roma 1" delay={0.14} />
          <FloatingInput label="Città" value={billing.billing_city} onChange={(v) => update("billing_city", v)} placeholder="Roma" delay={0.17} />
          <FloatingInput label="CAP" value={billing.billing_zip} onChange={(v) => update("billing_zip", onlyDigits(v))} placeholder="00100" delay={0.2} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepBilling;
