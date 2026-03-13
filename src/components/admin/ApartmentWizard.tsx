import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  Building2,
  FileText,
  Users,
  Sparkles,
  Check,
} from "lucide-react";

interface ApartmentForm {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  price_per_night: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  services: string[];
  address: string | null;
  is_active: boolean;
}

const STEPS = [
  { title: "Identità", subtitle: "Nome e categoria", icon: Building2 },
  { title: "Spazi", subtitle: "Capienza e dimensioni", icon: Users },
  { title: "Descrizione", subtitle: "Testi e indirizzo", icon: FileText },
  { title: "Dettagli", subtitle: "Servizi e pubblicazione", icon: Sparkles },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.96,
  }),
};

interface ApartmentWizardProps {
  initialData: ApartmentForm;
  initialServices: string;
  isEditing: boolean;
  editName?: string;
  onSave: (form: ApartmentForm, servicesInput: string) => void;
  onClose: () => void;
}

const ApartmentWizard = ({
  initialData,
  initialServices,
  isEditing,
  editName,
  onSave,
  onClose,
}: ApartmentWizardProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [form, setForm] = useState<ApartmentForm>(initialData);
  const [servicesInput, setServicesInput] = useState(initialServices);

  const progress = ((step + 1) / STEPS.length) * 100;

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSave = () => {
    onSave(form, servicesInput);
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="bg-background border-primary/20 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <motion.h2
              className="font-serif text-2xl font-light text-foreground"
              key={isEditing ? "edit" : "create"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {isEditing ? `Modifica: ${editName}` : "Nuovo appartamento"}
            </motion.h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === step;
              const isDone = i < step;

              return (
                <motion.button
                  key={i}
                  onClick={() => {
                    setDirection(i > step ? 1 : -1);
                    setStep(i);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-sans tracking-wide uppercase transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.title}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-1 bg-muted" />
        </div>

        <CardContent className="pt-2 pb-6">
          {/* Step subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              className="font-sans text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {STEPS[step].subtitle}
            </motion.p>
          </AnimatePresence>

          {/* Step content */}
          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.35,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {step === 0 && (
                  <StepIdentity form={form} setForm={setForm} />
                )}
                {step === 1 && (
                  <StepSpaces form={form} setForm={setForm} />
                )}
                {step === 2 && (
                  <StepDescription form={form} setForm={setForm} />
                )}
                {step === 3 && (
                  <StepDetails
                    form={form}
                    setForm={setForm}
                    servicesInput={servicesInput}
                    setServicesInput={setServicesInput}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={step === 0 ? onClose : goPrev}
              className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? "Annulla" : "Indietro"}
            </motion.button>

            {isLastStep ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salva
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition-colors"
              >
                Avanti
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ─── Step Components ─── */

const fieldLabel = "font-sans text-xs text-muted-foreground uppercase tracking-wider mb-1 block";

function StepIdentity({
  form,
  setForm,
}: {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2">
        <label className={fieldLabel}>Nome dell'appartamento</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="es. Oceano Suite"
          className="text-base"
        />
      </div>
      <div>
        <label className={fieldLabel}>Slug (URL)</label>
        <Input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="es. oceano-suite"
        />
      </div>
      <div>
        <label className={fieldLabel}>Categoria</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="residence">Residence</option>
          <option value="penthouse">Penthouse</option>
          <option value="compact">Compact</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={fieldLabel}>Tagline</label>
        <Input
          value={form.tagline ?? ""}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          placeholder="Una frase che descrive l'essenza..."
        />
      </div>
    </div>
  );
}

function StepSpaces({
  form,
  setForm,
}: {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
}) {
  const fields = [
    { label: "Prezzo / notte (€)", key: "price_per_night" as const },
    { label: "Ospiti max", key: "guests" as const },
    { label: "Camere da letto", key: "bedrooms" as const },
    { label: "Bagni", key: "bathrooms" as const },
    { label: "Superficie (mq)", key: "sqm" as const },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {fields.map((f) => (
        <div key={f.key}>
          <label className={fieldLabel}>{f.label}</label>
          <Input
            type="number"
            value={form[f.key]}
            onChange={(e) =>
              setForm({ ...form, [f.key]: Number(e.target.value) })
            }
          />
        </div>
      ))}
    </div>
  );
}

function StepDescription({
  form,
  setForm,
}: {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={fieldLabel}>Descrizione</label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          placeholder="Racconta cosa rende unico questo appartamento..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className={fieldLabel}>Indirizzo</label>
        <Input
          value={form.address ?? ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Via, numero civico, città..."
        />
      </div>
    </div>
  );
}

function StepDetails({
  form,
  setForm,
  servicesInput,
  setServicesInput,
}: {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
  servicesInput: string;
  setServicesInput: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={fieldLabel}>Servizi (separati da virgola)</label>
        <Input
          value={servicesInput}
          onChange={(e) => setServicesInput(e.target.value)}
          placeholder="Wi-Fi, Aria condizionata, Smart TV..."
        />
        {servicesInput && (
          <motion.div
            className="flex flex-wrap gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {servicesInput
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="inline-block font-sans text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                >
                  {s}
                </motion.span>
              ))}
          </motion.div>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <label className={fieldLabel}>Pubblicare subito?</label>
        <motion.button
          type="button"
          onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            form.is_active ? "bg-primary" : "bg-muted"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm"
            animate={{ left: form.is_active ? "calc(100% - 20px)" : "4px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
        <span className="font-sans text-sm text-foreground">
          {form.is_active ? "Sì, attivo" : "No, bozza"}
        </span>
      </div>
    </div>
  );
}

export default ApartmentWizard;
