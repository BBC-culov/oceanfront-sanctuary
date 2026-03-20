import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, User, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface GuestData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  email: string;
  nationality: string;
  id_card_number: string;
  id_card_issued: string;
  id_card_expiry: string;
}

export interface AdditionalGuestData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
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
  first_name: "",
  last_name: "",
  date_of_birth: "",
  nationality: "",
  id_card_number: "",
  id_card_issued: "",
  id_card_expiry: "",
};

const fieldAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const LabeledInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => (
  <motion.div {...fieldAnim} className="space-y-1.5">
    <label className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="bg-background border-border font-sans text-sm"
    />
  </motion.div>
);

const StepGuestData = ({
  mainGuest,
  setMainGuest,
  additionalGuests,
  setAdditionalGuests,
  maxGuests,
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
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Main guest */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-light text-foreground">Ospite principale</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput label="Nome" value={mainGuest.first_name} onChange={(v) => updateMain("first_name", v)} placeholder="Mario" />
          <LabeledInput label="Cognome" value={mainGuest.last_name} onChange={(v) => updateMain("last_name", v)} placeholder="Rossi" />
          <LabeledInput label="Data di nascita" value={mainGuest.date_of_birth} onChange={(v) => updateMain("date_of_birth", v)} type="date" />
          <LabeledInput label="Luogo di nascita" value={mainGuest.place_of_birth} onChange={(v) => updateMain("place_of_birth", v)} placeholder="Roma" />
          <LabeledInput label="Telefono" value={mainGuest.phone} onChange={(v) => updateMain("phone", v)} type="tel" placeholder="+39 333 1234567" />
          <LabeledInput label="Email" value={mainGuest.email} onChange={(v) => updateMain("email", v)} type="email" placeholder="mario@email.com" />
          <LabeledInput label="Nazionalità" value={mainGuest.nationality} onChange={(v) => updateMain("nationality", v)} placeholder="Italiana" />
          <LabeledInput label="Numero carta d'identità" value={mainGuest.id_card_number} onChange={(v) => updateMain("id_card_number", v)} placeholder="CA00000AA" />
          <LabeledInput label="Data emissione" value={mainGuest.id_card_issued} onChange={(v) => updateMain("id_card_issued", v)} type="date" />
          <LabeledInput label="Data scadenza" value={mainGuest.id_card_expiry} onChange={(v) => updateMain("id_card_expiry", v)} type="date" />
        </div>
      </div>

      {/* Additional guests */}
      <AnimatePresence>
        {additionalGuests.map((guest, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-light text-foreground">
                    Ospite {i + 2}
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeGuest(i)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput label="Nome" value={guest.first_name} onChange={(v) => updateGuest(i, "first_name", v)} placeholder="Nome" />
                <LabeledInput label="Cognome" value={guest.last_name} onChange={(v) => updateGuest(i, "last_name", v)} placeholder="Cognome" />
                <LabeledInput label="Data di nascita" value={guest.date_of_birth} onChange={(v) => updateGuest(i, "date_of_birth", v)} type="date" />
                <LabeledInput label="Nazionalità" value={guest.nationality} onChange={(v) => updateGuest(i, "nationality", v)} placeholder="Nazionalità" />
                <LabeledInput label="Numero carta d'identità" value={guest.id_card_number} onChange={(v) => updateGuest(i, "id_card_number", v)} placeholder="CA00000AA" />
                <LabeledInput label="Data emissione" value={guest.id_card_issued} onChange={(v) => updateGuest(i, "id_card_issued", v)} type="date" />
                <LabeledInput label="Data scadenza" value={guest.id_card_expiry} onChange={(v) => updateGuest(i, "id_card_expiry", v)} type="date" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add guest button */}
      {additionalGuests.length < maxGuests - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addGuest}
          className="w-full py-4 border-2 border-dashed border-border hover:border-primary/40 transition-colors flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          <span className="font-sans text-xs tracking-[0.15em] uppercase">
            Aggiungi ospite ({additionalGuests.length + 1}/{maxGuests})
          </span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default StepGuestData;
