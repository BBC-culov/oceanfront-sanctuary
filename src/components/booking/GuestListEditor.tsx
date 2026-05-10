// Reusable additional-guest editor (CRUD list).
// Used by client request dialog and admin edit dialog.
import { Plus, Trash2, UserPlus } from "lucide-react";

export interface GuestRow {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  id_type: string;
  id_card_number: string;
  id_card_issued: string;
  id_card_expiry: string;
}

export const emptyGuest = (): GuestRow => ({
  first_name: "",
  last_name: "",
  date_of_birth: "",
  nationality: "",
  id_type: "id_card",
  id_card_number: "",
  id_card_issued: "",
  id_card_expiry: "",
});

interface Props {
  guests: GuestRow[];
  onChange: (next: GuestRow[]) => void;
  max?: number;
}

export default function GuestListEditor({ guests, onChange, max = 10 }: Props) {
  const update = (i: number, patch: Partial<GuestRow>) => {
    const next = guests.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
    onChange(next);
  };
  const remove = (i: number) => onChange(guests.filter((_, idx) => idx !== i));
  const add = () => guests.length < max && onChange([...guests, emptyGuest()]);

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">{label}</label>
      {children}
    </div>
  );
  const inputCls = "h-10 w-full px-3 rounded-md bg-background border border-border text-sm";

  return (
    <div className="space-y-4">
      {guests.length === 0 && (
        <p className="font-sans text-xs text-muted-foreground italic">Nessun ospite aggiuntivo.</p>
      )}
      {guests.map((g, i) => (
        <div key={i} className="rounded-md border border-border/60 bg-background/40 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Ospite {i + 2}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-destructive/80 hover:text-destructive p-1"
              aria-label="Rimuovi ospite"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Anagrafica */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Anagrafica</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome">
                <input value={g.first_name} onChange={(e) => update(i, { first_name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Cognome">
                <input value={g.last_name} onChange={(e) => update(i, { last_name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Data di nascita">
                <input type="date" value={g.date_of_birth} onChange={(e) => update(i, { date_of_birth: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Nazionalità">
                <input value={g.nationality} onChange={(e) => update(i, { nationality: e.target.value })} className={inputCls} />
              </Field>
            </div>
          </div>

          {/* Documento */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Documento d'identità</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Tipo documento">
                <select value={g.id_type} onChange={(e) => update(i, { id_type: e.target.value })} className={inputCls}>
                  <option value="id_card">Carta d'identità</option>
                  <option value="passport">Passaporto</option>
                  <option value="driver_license">Patente</option>
                </select>
              </Field>
              <Field label="Numero documento">
                <input value={g.id_card_number} onChange={(e) => update(i, { id_card_number: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Data di rilascio">
                <input type="date" value={g.id_card_issued} onChange={(e) => update(i, { id_card_issued: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Data di scadenza">
                <input type="date" value={g.id_card_expiry} onChange={(e) => update(i, { id_card_expiry: e.target.value })} className={inputCls} />
              </Field>
            </div>
          </div>
        </div>
      ))}
      {guests.length < max && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border text-sm hover:bg-secondary"
        >
          <Plus className="w-4 h-4" /> Aggiungi ospite
        </button>
      )}
    </div>
  );
}
