import { fieldLabel } from "./shared";
import type { ApartmentForm } from "./types";

interface StepDescriptionProps {
  form: ApartmentForm;
  setForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
}

const StepDescription = ({ form, setForm }: StepDescriptionProps) => {
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
};

export default StepDescription;
