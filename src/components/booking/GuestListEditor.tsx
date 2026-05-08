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

  return (
    <div className="space-y-3">
      {guests.length === 0 && (
        <p className="font-sans text-xs text-muted-foreground italic">Nessun ospite aggiuntivo.</p>
      )}
      {guests.map((g, i) => (
        <div key={i} className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs uppercase tracking-wide text-muted-foreground">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={g.first_name} onChange={(e) => update(i, { first_name: e.target.value })}
              placeholder="Nome" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
            <input value={g.last_name} onChange={(e) => update(i, { last_name: e.target.value })}
              placeholder="Cognome" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
            <input type="date" value={g.date_of_birth} onChange={(e) => update(i, { date_of_birth: e.target.value })}
              placeholder="Data di nascita" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
            <input value={g.nationality} onChange={(e) => update(i, { nationality: e.target.value })}
              placeholder="Nazionalità" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
            <select value={g.id_type} onChange={(e) => update(i, { id_type: e.target.value })}
              className="h-10 px-3 rounded-md bg-background border border-border text-sm">
              <option value="id_card">Carta d'identità</option>
              <option value="passport">Passaporto</option>
              <option value="driver_license">Patente</option>
            </select>
            <input value={g.id_card_number} onChange={(e) => update(i, { id_card_number: e.target.value })}
              placeholder="Numero documento" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
            <input type="date" value={g.id_card_issued} onChange={(e) => update(i, { id_card_issued: e.target.value })}
              placeholder="Rilascio" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
            <input type="date" value={g.id_card_expiry} onChange={(e) => update(i, { id_card_expiry: e.target.value })}
              placeholder="Scadenza" className="h-10 px-3 rounded-md bg-background border border-border text-sm" />
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
