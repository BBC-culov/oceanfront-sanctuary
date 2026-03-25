import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
  ImagePlus,
  Check,
  Upload,
  Trash2,
  GripVertical,
  Loader2,
  AlertCircle,
  MapPin,
  Wifi,
  Wind,
  Tv,
  Car,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Sun,
  ShieldCheck,
  Coffee,
  Clapperboard,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  map_query?: string | null;
  check_in_time: string;
  check_out_time: string;
}

export type { ApartmentForm };

type ValidationErrors = Record<string, string>;

const STEPS = [
  { title: "Identità", subtitle: "Nome, categoria e posizione", icon: Building2 },
  { title: "Spazi", subtitle: "Capienza, dimensioni e prezzo", icon: Users },
  { title: "Descrizione", subtitle: "Testi e informazioni", icon: FileText },
  { title: "Immagini", subtitle: "Foto dell'appartamento", icon: ImagePlus },
  { title: "Video", subtitle: "Video house tour", icon: Clapperboard },
  { title: "Servizi", subtitle: "Amenities e pubblicazione", icon: Sparkles },
];

const PRESET_SERVICES = [
  { label: "Wi-Fi", icon: Wifi },
  { label: "Aria condizionata", icon: Wind },
  { label: "Smart TV", icon: Tv },
  { label: "Parcheggio", icon: Car },
  { label: "Cucina attrezzata", icon: UtensilsCrossed },
  { label: "Lavatrice", icon: WashingMachine },
  { label: "Vista mare", icon: Waves },
  { label: "Terrazza", icon: Sun },
  { label: "Cassaforte", icon: ShieldCheck },
  { label: "Macchina del caffè", icon: Coffee },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
};

function validateStep(step: number, form: ApartmentForm): ValidationErrors {
  const errors: ValidationErrors = {};
  if (step === 0) {
    if (!form.name.trim()) errors.name = "Il nome è obbligatorio";
    if (!form.slug.trim()) errors.slug = "Lo slug è obbligatorio";
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = "Solo lettere minuscole, numeri e trattini";
  }
  if (step === 1) {
    if (form.price_per_night < 0) errors.price_per_night = "Il prezzo non può essere negativo";
    if (form.guests < 1) errors.guests = "Almeno 1 ospite";
    if (form.bedrooms < 1) errors.bedrooms = "Almeno 1 camera";
    if (form.bathrooms < 1) errors.bathrooms = "Almeno 1 bagno";
    if (form.sqm < 1) errors.sqm = "La superficie deve essere positiva";
    if (!form.check_in_time.trim()) errors.check_in_time = "Orario check-in obbligatorio";
    if (!form.check_out_time.trim()) errors.check_out_time = "Orario check-out obbligatorio";
  }
  return errors;
}

interface ApartmentWizardProps {
  initialData: ApartmentForm;
  initialServices: string;
  initialImages: string[];
  isEditing: boolean;
  editName?: string;
  editId?: string;
  onSave: (form: ApartmentForm, servicesInput: string, images: string[]) => void;
  onClose: () => void;
}

const ApartmentWizard = ({
  initialData,
  initialServices,
  initialImages,
  isEditing,
  editName,
  editId,
  onSave,
  onClose,
}: ApartmentWizardProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [form, setForm] = useState<ApartmentForm>(initialData);
  const [servicesInput, setServicesInput] = useState(initialServices);
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const progress = ((step + 1) / STEPS.length) * 100;

  const goNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    setErrors({});
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const goToStep = (i: number) => {
    if (i > step) {
      const stepErrors = validateStep(step, form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    setErrors({});
    setDirection(i > step ? 1 : -1);
    setStep(i);
  };

  const handleSave = () => {
    for (let s = 0; s < STEPS.length; s++) {
      const stepErrors = validateStep(s, form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setDirection(s > step ? 1 : -1);
        setStep(s);
        toast({ title: "Correggi gli errori", description: "Alcuni campi non sono validi", variant: "destructive" });
        return;
      }
    }
    onSave(form, servicesInput, images);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const folder = editId || form.slug || `new-${Date.now()}`;
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("apartment-images").upload(path, file, { upsert: true });
      if (error) {
        toast({ title: "Errore upload", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("apartment-images").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const removeImage = async (url: string) => {
    const bucketUrl = `/apartment-images/`;
    const pathStart = url.indexOf(bucketUrl);
    if (pathStart !== -1) {
      const path = url.slice(pathStart + bucketUrl.length);
      await supabase.storage.from("apartment-images").remove([path]);
    }
    setImages((prev) => prev.filter((u) => u !== url));
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
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <motion.button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-sans tracking-wide uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? "bg-primary text-primary-foreground shadow-md" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  animate={isActive ? { y: [0, -2, 0] } : {}}
                  transition={isActive ? { duration: 0.4 } : {}}
                >
                  {isDone ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.title}</span>
                </motion.button>
              );
            })}
          </div>
          <Progress value={progress} className="h-1 bg-muted" />
        </div>

        <CardContent className="pt-2 pb-6">
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

          <div className="relative min-h-[260px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {step === 0 && <StepIdentity form={form} setForm={setForm} errors={errors} />}
                {step === 1 && <StepSpaces form={form} setForm={setForm} errors={errors} />}
                {step === 2 && <StepDescription form={form} setForm={setForm} />}
                {step === 3 && (
                  <StepImages images={images} setImages={setImages} uploading={uploading} onUpload={handleUpload} onRemove={removeImage} />
                )}
                {step === 4 && (
                  <StepDetails form={form} setForm={setForm} servicesInput={servicesInput} setServicesInput={setServicesInput} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={step === 0 ? onClose : goPrev}
              className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? "Annulla" : "Indietro"}
            </motion.button>

            {isLastStep ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition-colors rounded-md shadow-md"
              >
                <Save className="w-4 h-4" />
                Salva
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goNext}
                className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition-colors rounded-md"
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

/* ─── Shared ─── */

const fieldLabel = "font-sans text-xs text-muted-foreground uppercase tracking-wider mb-1 block";

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 font-sans text-xs text-destructive mt-1"
    >
      <AlertCircle className="w-3 h-3" />
      {message}
    </motion.p>
  );
};

/* ─── Step Components ─── */

function StepIdentity({ form, setForm, errors }: { form: ApartmentForm; setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>; errors: ValidationErrors }) {
  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2">
        <label className={fieldLabel}>Nome dell'appartamento *</label>
        <Input
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm({ ...form, name, slug: form.slug || autoSlug(name) });
          }}
          placeholder="es. Oceano Suite"
          className={`text-base ${errors.name ? "border-destructive" : ""}`}
        />
        <FieldError message={errors.name} />
      </div>
      <div>
        <label className={fieldLabel}>Slug (URL) *</label>
        <Input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
          placeholder="es. oceano-suite"
          className={errors.slug ? "border-destructive" : ""}
        />
        <FieldError message={errors.slug} />
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
      <div className="sm:col-span-2">
        <label className={fieldLabel}>
          <MapPin className="w-3 h-3 inline mr-1" />
          Indirizzo
        </label>
        <Input
          value={form.address ?? ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Via, numero civico, città..."
        />
      </div>
      <div className="sm:col-span-2">
        <label className={fieldLabel}>
          <MapPin className="w-3 h-3 inline mr-1" />
          Query mappa (per Google Maps embed)
        </label>
        <Input
          value={form.map_query ?? ""}
          onChange={(e) => setForm({ ...form, map_query: e.target.value })}
          placeholder="es. Praia Cabral, Boa Vista, Capo Verde"
        />
        <p className="font-sans text-[10px] text-muted-foreground mt-1">Usata per mostrare la mappa nella pagina dettaglio</p>
      </div>
    </div>
  );
}

function StepSpaces({ form, setForm, errors }: { form: ApartmentForm; setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>; errors: ValidationErrors }) {
  const fields = [
    { label: "Prezzo / notte (€)", key: "price_per_night" as const, min: 0 },
    { label: "Ospiti max", key: "guests" as const, min: 1 },
    { label: "Camere da letto", key: "bedrooms" as const, min: 1 },
    { label: "Bagni", key: "bathrooms" as const, min: 1 },
    { label: "Superficie (mq)", key: "sqm" as const, min: 1 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {fields.map((f, i) => (
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
}

function StepDescription({ form, setForm }: { form: ApartmentForm; setForm: React.Dispatch<React.SetStateAction<ApartmentForm>> }) {
  const charCount = (form.description ?? "").length;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={fieldLabel}>Descrizione</label>
          <span className={`font-sans text-[10px] ${charCount > 500 ? "text-accent-foreground" : "text-muted-foreground"}`}>
            {charCount} caratteri
          </span>
        </div>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={5}
          placeholder="Racconta cosa rende unico questo appartamento..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>
    </div>
  );
}

function StepImages({
  images,
  setImages,
  uploading,
  onUpload,
  onRemove,
}: {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  uploading: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="space-y-5">
      <motion.label
        className="relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors group"
        whileHover={{ scale: 1.01 }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => onUpload(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        ) : (
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
          </motion.div>
        )}
        <span className="font-sans text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {uploading ? "Caricamento in corso..." : "Trascina o clicca per caricare immagini"}
        </span>
        <span className="font-sans text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 5MB per file</span>
      </motion.label>

      {images.length > 0 && (
        <div>
          <p className="font-sans text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <GripVertical className="w-3 h-3" /> Trascina per riordinare — la prima immagine sarà la copertina
          </p>
          <Reorder.Group axis="y" values={images} onReorder={setImages} className="space-y-2">
            {images.map((url, i) => (
              <Reorder.Item
                key={url}
                value={url}
                className="flex items-center gap-3 bg-muted/30 rounded-md p-2 border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  {i === 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-block font-sans text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded"
                    >
                      Copertina
                    </motion.span>
                  )}
                  <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">Immagine {i + 1}</p>
                </div>
                <button
                  onClick={() => onRemove(url)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-center font-sans text-sm text-muted-foreground py-4">Nessuna immagine caricata</p>
      )}
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
}

export default ApartmentWizard;
