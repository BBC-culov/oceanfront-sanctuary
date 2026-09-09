import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fieldLabel, FieldError } from "./shared";
import type { ApartmentForm, ValidationErrors } from "./types";

interface StepIdentityProps {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
  errors: ValidationErrors;
}

const autoSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const StepIdentity = ({ form, setForm, errors }: StepIdentityProps) => (
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

export default StepIdentity;
