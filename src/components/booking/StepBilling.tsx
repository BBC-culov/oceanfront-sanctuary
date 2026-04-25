import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  onlyDigits, onlyAlphanumeric, isValidZip, isValidFiscalCode,
  getFiscalCodeLabel, getFiscalCodePlaceholder, getFiscalCodeHint,
} from "@/lib/bookingValidation";

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
  label, value, onChange, placeholder, required = true, delay = 0, span2 = false, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; delay?: number; span2?: boolean; error?: string;
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
      className={`bg-card/50 border-border/60 font-sans text-sm h-11 focus:border-primary/40 focus:bg-background transition-all duration-200 ${error ? "border-destructive focus:border-destructive ring-1 ring-destructive/30" : ""}`}
    />
    {error && (
      <p className="mt-1 font-sans text-[10px] text-destructive">{error}</p>
    )}
  </motion.div>
);

const StepBilling = ({ billing, setBilling }: StepBillingProps) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = useCallback((key: string) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const update = (field: keyof BillingData, value: string) => {
    touch(field);
    setBilling({ ...billing, [field]: value });
  };

  const t = (key: string) => touched[key] ?? false;

  const reqErr = (val: string, key: string) => {
    if (!t(key)) return undefined;
    return !val.trim() ? "Campo obbligatorio" : undefined;
  };

  const zipErr = () => {
    if (!t("billing_zip") || !billing.billing_zip) return reqErr(billing.billing_zip, "billing_zip");
    if (!isValidZip(billing.billing_zip)) return "3-10 cifre richieste";
    return undefined;
  };

  const fiscalErr = () => {
    if (!t("billing_fiscal_code") || !billing.billing_fiscal_code) return reqErr(billing.billing_fiscal_code, "billing_fiscal_code");
    if (!isValidFiscalCode(billing.billing_fiscal_code, billing.billing_country)) {
      return getFiscalCodeHint(billing.billing_country);
    }
    return undefined;
  };

  const fiscalLabel = getFiscalCodeLabel(billing.billing_country);
  const fiscalPlaceholder = getFiscalCodePlaceholder(billing.billing_country);

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
          <FloatingInput span2 label="Intestatario" value={billing.billing_name} onChange={(v) => update("billing_name", v)} placeholder="Mario Rossi / Azienda SRL" delay={0.05} error={reqErr(billing.billing_name, "billing_name")} />
          <FloatingInput label={fiscalLabel} value={billing.billing_fiscal_code} onChange={(v) => update("billing_fiscal_code", onlyAlphanumeric(v).toUpperCase())} placeholder={fiscalPlaceholder} delay={0.08} error={fiscalErr()} />
          <FloatingInput label="Paese" value={billing.billing_country} onChange={(v) => update("billing_country", v)} placeholder="Italia" delay={0.11} error={reqErr(billing.billing_country, "billing_country")} />
          <FloatingInput span2 label="Indirizzo" value={billing.billing_address} onChange={(v) => update("billing_address", v)} placeholder="Via Roma 1" delay={0.14} error={reqErr(billing.billing_address, "billing_address")} />
          <FloatingInput label="Città" value={billing.billing_city} onChange={(v) => update("billing_city", v)} placeholder="Roma" delay={0.17} error={reqErr(billing.billing_city, "billing_city")} />
          <FloatingInput label="CAP" value={billing.billing_zip} onChange={(v) => update("billing_zip", onlyDigits(v))} placeholder="00100" delay={0.2} error={zipErr()} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepBilling;
