// Renders a human-readable diff between current_data and requested_changes
// snapshots stored on a booking_modification_requests row.
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  check_in: "Check-in",
  check_out: "Check-out",
  guest_name: "Nome",
  guest_last_name: "Cognome",
  guest_phone: "Telefono",
  guest_date_of_birth: "Data di nascita",
  guest_place_of_birth: "Luogo di nascita",
  guest_nationality: "Nazionalità",
  guest_id_type: "Tipo documento",
  guest_id_card_number: "Numero documento",
  guest_id_card_issued: "Rilascio documento",
  guest_id_card_expiry: "Scadenza documento",
  flight_outbound: "Volo andata",
  flight_return: "Volo ritorno",
  arrival_time: "Orario arrivo",
  departure_time: "Orario partenza",
  airline: "Compagnia aerea",
  no_transfer: "Senza trasporto",
  notes: "Note",
  selected_services: "Servizi",
  additional_guests: "Ospiti aggiuntivi",
};

const fmtVal = (k: string, v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (k === "check_in" || k === "check_out" || k.endsWith("date_of_birth") || k.endsWith("issued") || k.endsWith("expiry")) {
    try { return format(new Date(v), "d MMM yyyy", { locale: it }); } catch { return String(v); }
  }
  if (k === "no_transfer") return v ? "Sì" : "No";
  if (k === "selected_services" && Array.isArray(v)) {
    if (v.length === 0) return "Nessuno";
    return v.map((s: any) => (typeof s === "string" ? s : s?.name ?? "?")).join(", ");
  }
  if (k === "additional_guests" && Array.isArray(v)) {
    if (v.length === 0) return "Nessuno";
    return v.map((g: any) => `${g.first_name ?? ""} ${g.last_name ?? ""}`.trim() || "Ospite").join(", ");
  }
  return String(v);
};

export default function ModificationDiff({
  current, proposed,
}: { current: Record<string, any>; proposed: Record<string, any> }) {
  const keys = Object.keys(proposed).filter((k) => {
    const a = JSON.stringify(current?.[k] ?? null);
    const b = JSON.stringify(proposed?.[k] ?? null);
    return a !== b;
  });

  if (keys.length === 0) {
    return <p className="font-sans text-sm text-muted-foreground italic">Nessuna modifica rilevata</p>;
  }

  return (
    <div className="space-y-2">
      {keys.map((k) => (
        <div key={k} className="grid grid-cols-[160px_1fr] gap-3 items-start py-2 border-b border-border/30 last:border-0">
          <span className="font-sans text-xs uppercase tracking-wide text-muted-foreground pt-0.5">
            {FIELD_LABELS[k] ?? k}
          </span>
          <div className="flex items-start gap-2 flex-wrap text-sm">
            <span className="font-sans text-muted-foreground line-through">{fmtVal(k, current?.[k])}</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary mt-1" />
            <span className="font-sans text-foreground font-medium">{fmtVal(k, proposed?.[k])}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
