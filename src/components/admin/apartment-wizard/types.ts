import {
  Building2,
  Clapperboard,
  Coffee,
  FileText,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  Sun,
  Tv,
  UtensilsCrossed,
  Users,
  Car,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";

export interface ApartmentForm {
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

export type ValidationErrors = Record<string, string>;

export const STEPS = [
  { title: "Identità", subtitle: "Nome, categoria e posizione", icon: Building2 },
  { title: "Spazi", subtitle: "Capienza, dimensioni e prezzo", icon: Users },
  { title: "Descrizione", subtitle: "Testi e informazioni", icon: FileText },
  { title: "Immagini", subtitle: "Foto dell'appartamento", icon: ImagePlus },
  { title: "Video", subtitle: "Video house tour", icon: Clapperboard },
  { title: "Servizi", subtitle: "Amenities e pubblicazione", icon: Sparkles },
];

export const PRESET_SERVICES = [
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

export const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
};

/** Per-step validation rules — unchanged from the original wizard. */
export function validateStep(step: number, form: ApartmentForm): ValidationErrors {
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
