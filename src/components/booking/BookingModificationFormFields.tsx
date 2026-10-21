// Shared UI pieces for the customer and admin booking-edit dialogs.
import { AlertCircle, Users } from "lucide-react";
import GuestListEditor, { type GuestRow } from "./GuestListEditor";
import type { FieldErrors } from "@/lib/modificationValidation";

export const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{msg}</p> : null;

interface AdditionalGuestsProps {
  guests: GuestRow[];
  setGuests: (g: GuestRow[]) => void;
  editGuests: boolean;
  setEditGuests: (v: boolean) => void;
  errors: FieldErrors;
}

export function AdditionalGuestsSection({ guests, setGuests, editGuests, setEditGuests, errors }: AdditionalGuestsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          <Users className="w-3.5 h-3.5" /> Ospiti aggiuntivi
        </h3>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={editGuests} onChange={(e) => setEditGuests(e.target.checked)} />
          Modifica ospiti
        </label>
      </div>
      {editGuests ? (
        <>
          <GuestListEditor guests={guests} onChange={setGuests} />
          {Object.keys(errors).some((k) => k.startsWith("guest_")) && (
            <p className="mt-2 text-[11px] text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Compila correttamente tutti i campi degli ospiti
            </p>
          )}
        </>
      ) : (
        <p className="font-sans text-xs text-muted-foreground italic">
          Spunta "Modifica ospiti" per aggiungere o modificare gli ospiti registrati ({guests.length} attuali).
        </p>
      )}
    </section>
  );
}
