import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, User, UserPlus, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PhonePrefixInput from "@/components/PhonePrefixInput";

export type IdDocumentType = "id_card" | "passport";

export interface GuestData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  email: string;
  nationality: string;
  id_type: IdDocumentType;
  id_card_number: string;
  id_card_issued: string;
  id_card_expiry: string;
}

export interface AdditionalGuestData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  id_type: IdDocumentType;
  id_card_number: string;
  id_card_issued: string;
  id_card_expiry: string;
}

interface StepGuestDataProps {
  mainGuest: GuestData;
  setMainGuest: (g: GuestData) => void;
  additionalGuests: AdditionalGuestData[];
  setAdditionalGuests: (g: AdditionalGuestData[]) => void;
  maxGuests: number;
}

const emptyAdditionalGuest: AdditionalGuestData = {
  first_name: "", last_name: "", date_of_birth: "",
  nationality: "", id_type: "id_card", id_card_number: "", id_card_issued: "", id_card_expiry: "",
};

const docTypeLabels: Record<IdDocumentType, string> = {
  id_card: "Carta d'identità",
  passport: "Passaporto",
};

const FloatingInput = ({
  label, value, onChange, type = "text", placeholder, required = true, delay = 0, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; delay?: number; disabled?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    className="relative"
  >
    <label className="block font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5">
      {label} {required && <span className="text-primary/70">*</span>}
    </label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`bg-card/50 border-border/60 font-sans text-sm h-11 focus:border-primary/40 focus:bg-background transition-all duration-200 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    />
  </motion.div>
);

const GuestCard = ({
  title, icon: Icon, children, index = 0, onRemove,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  index?: number; onRemove?: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10, height: 0 }}
    transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    className="relative bg-card/40 border border-border/50 p-6 sm:p-7 space-y-5"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-serif text-lg text-foreground">{title}</h3>
      </div>
      {onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
    {children}
  </motion.div>
);

const StepGuestData = ({
  mainGuest, setMainGuest, additionalGuests, setAdditionalGuests, maxGuests,
}: StepGuestDataProps) => {
  const updateMain = (field: keyof GuestData, value: string) => {
    setMainGuest({ ...mainGuest, [field]: value });
  };

  const addGuest = () => {
    if (additionalGuests.length < maxGuests - 1) {
      setAdditionalGuests([...additionalGuests, { ...emptyAdditionalGuest }]);
    }
  };

  const removeGuest = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: keyof AdditionalGuestData, value: string) => {
    const updated = [...additionalGuests];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalGuests(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Main guest */}
      <GuestCard title="Ospite principale" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
          <FloatingInput label="Nome" value={mainGuest.first_name} onChange={(v) => updateMain("first_name", v)} placeholder="Mario" delay={0.05} />
          <FloatingInput label="Cognome" value={mainGuest.last_name} onChange={(v) => updateMain("last_name", v)} placeholder="Rossi" delay={0.08} />
          <FloatingInput label="Data di nascita" value={mainGuest.date_of_birth} onChange={(v) => updateMain("date_of_birth", v)} type="date" delay={0.11} />
          <FloatingInput label="Luogo di nascita" value={mainGuest.place_of_birth} onChange={(v) => updateMain("place_of_birth", v)} placeholder="Roma" delay={0.14} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.17, ease: [0.16, 1, 0.3, 1] }}
          >
            <label className="block font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5">
              Telefono <span className="text-primary/70">*</span>
            </label>
            <PhonePrefixInput
              value={mainGuest.phone}
              onChange={(v) => updateMain("phone", v)}
              variant="compact"
              placeholder="333 1234567"
            />
          </motion.div>
          <FloatingInput label="Email" value={mainGuest.email} onChange={(v) => updateMain("email", v)} type="email" placeholder="mario@email.com" delay={0.2} disabled />
          <FloatingInput label="Nazionalità" value={mainGuest.nationality} onChange={(v) => updateMain("nationality", v)} placeholder="Italiana" delay={0.23} />
        </div>

        {/* Document sub-section */}
        <div className="pt-3 mt-3 border-t border-border/30">
          <div className="flex items-center gap-2 mb-3.5">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="font-sans text-[11px] tracking-wide uppercase text-muted-foreground">Documento</span>
          </div>
          <div className="mb-3.5">
            <label className="block font-sans text-[11px] tracking-wide text-muted-foreground mb-2">
              Tipo di documento <span className="text-primary/70">*</span>
            </label>
            <RadioGroup
              value={mainGuest.id_type}
              onValueChange={(v) => updateMain("id_type", v)}
              className="flex gap-4"
            >
              {(["id_card", "passport"] as IdDocumentType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={t} />
                  <span className="font-sans text-sm text-foreground">{docTypeLabels[t]}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3.5">
            <FloatingInput label="Numero" value={mainGuest.id_card_number} onChange={(v) => updateMain("id_card_number", v)} placeholder="CA00000AA" delay={0.26} />
            <FloatingInput label="Data emissione" value={mainGuest.id_card_issued} onChange={(v) => updateMain("id_card_issued", v)} type="date" delay={0.29} />
            <FloatingInput label="Data scadenza" value={mainGuest.id_card_expiry} onChange={(v) => updateMain("id_card_expiry", v)} type="date" delay={0.32} />
          </div>
        </div>
      </GuestCard>

      {/* Additional guests */}
      <AnimatePresence>
        {additionalGuests.map((guest, i) => (
          <GuestCard
            key={i}
            title={`Ospite ${i + 2}`}
            icon={UserPlus}
            index={i + 1}
            onRemove={() => removeGuest(i)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
              <FloatingInput label="Nome" value={guest.first_name} onChange={(v) => updateGuest(i, "first_name", v)} placeholder="Nome" />
              <FloatingInput label="Cognome" value={guest.last_name} onChange={(v) => updateGuest(i, "last_name", v)} placeholder="Cognome" />
              <FloatingInput label="Data di nascita" value={guest.date_of_birth} onChange={(v) => updateGuest(i, "date_of_birth", v)} type="date" />
              <FloatingInput label="Nazionalità" value={guest.nationality} onChange={(v) => updateGuest(i, "nationality", v)} placeholder="Nazionalità" />
            </div>
            <div className="pt-3 mt-1 border-t border-border/30">
              <div className="flex items-center gap-2 mb-3.5">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="font-sans text-[11px] tracking-wide uppercase text-muted-foreground">Documento</span>
              </div>
              <div className="mb-3.5">
                <label className="block font-sans text-[11px] tracking-wide text-muted-foreground mb-2">
                  Tipo di documento <span className="text-primary/70">*</span>
                </label>
                <RadioGroup
                  value={guest.id_type}
                  onValueChange={(v) => updateGuest(i, "id_type", v)}
                  className="flex gap-4"
                >
                  {(["id_card", "passport"] as IdDocumentType[]).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value={t} />
                      <span className="font-sans text-sm text-foreground">{docTypeLabels[t]}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3.5">
                <FloatingInput label="Numero" value={guest.id_card_number} onChange={(v) => updateGuest(i, "id_card_number", v)} placeholder="CA00000AA" />
                <FloatingInput label="Emissione" value={guest.id_card_issued} onChange={(v) => updateGuest(i, "id_card_issued", v)} type="date" />
                <FloatingInput label="Scadenza" value={guest.id_card_expiry} onChange={(v) => updateGuest(i, "id_card_expiry", v)} type="date" />
              </div>
            </div>
          </GuestCard>
        ))}
      </AnimatePresence>

      {/* Add guest button */}
      {additionalGuests.length < maxGuests - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={addGuest}
          className="w-full py-4 border border-dashed border-border/60 hover:border-primary/40 transition-all duration-300 flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group bg-transparent hover:bg-primary/[0.03]"
        >
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-sans text-[11px] tracking-[0.15em] uppercase">
            Aggiungi ospite ({additionalGuests.length + 1}/{maxGuests})
          </span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default StepGuestData;
