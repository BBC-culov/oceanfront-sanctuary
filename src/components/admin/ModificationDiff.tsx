// Renders a human-readable diff between current_data and requested_changes
// snapshots stored on a booking_modification_requests row.
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowRight, UserPlus, UserMinus, UserCog } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  check_in: "Check-in",
  check_out: "Check-out",
  guest_name: "Nome",
  guest_last_name: "Cognome",
  guest_phone: "Telefono",
  guest_email: "Email",
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
};

const GUEST_FIELD_LABELS: Record<string, string> = {
  first_name: "Nome",
  last_name: "Cognome",
  date_of_birth: "Data di nascita",
  nationality: "Nazionalità",
  id_type: "Tipo documento",
  id_card_number: "N. documento",
  id_card_issued: "Rilascio",
  id_card_expiry: "Scadenza",
};

const ID_TYPE_LABEL: Record<string, string> = {
  id_card: "Carta d'identità",
  passport: "Passaporto",
  driver_license: "Patente",
};

const isDateLike = (k: string) =>
  k === "check_in" || k === "check_out" ||
  k.endsWith("date_of_birth") || k.endsWith("issued") || k.endsWith("expiry");

const fmtVal = (k: string, v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (k === "id_type" || k === "guest_id_type") return ID_TYPE_LABEL[v] ?? String(v);
  if (isDateLike(k)) {
    try { return format(new Date(v), "d MMM yyyy", { locale: it }); } catch { return String(v); }
  }
  if (k === "no_transfer") return v ? "Sì" : "No";
  if (k === "selected_services" && Array.isArray(v)) {
    if (v.length === 0) return "Nessuno";
    return v.map((s: any) => (typeof s === "string" ? s : s?.name ?? "?")).join(", ");
  }
  return String(v);
};

const guestKey = (g: any) =>
  `${(g?.first_name ?? "").trim().toLowerCase()}|${(g?.last_name ?? "").trim().toLowerCase()}|${g?.date_of_birth ?? ""}`;

const guestLabel = (g: any, idx: number) =>
  `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() || `Ospite ${idx + 2}`;

function GuestFieldDiff({ label, current, proposed, fieldKey }: { label: string; current: any; proposed: any; fieldKey: string }) {
  const a = JSON.stringify(current ?? null);
  const b = JSON.stringify(proposed ?? null);
  if (a === b) return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 items-baseline text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-muted-foreground line-through">{fmtVal(fieldKey, current)}</span>
        <ArrowRight className="w-3 h-3 text-primary" />
        <span className="text-foreground font-medium">{fmtVal(fieldKey, proposed)}</span>
      </div>
    </div>
  );
}

function GuestsDiff({ current, proposed }: { current: any[]; proposed: any[] }) {
  const cMap = new Map<string, any>();
  current.forEach((g) => cMap.set(guestKey(g), g));
  const pMap = new Map<string, any>();
  proposed.forEach((g) => pMap.set(guestKey(g), g));

  const added = proposed.filter((g) => !cMap.has(guestKey(g)));
  const removed = current.filter((g) => !pMap.has(guestKey(g)));
  // For "modified", match same key but different details
  const modified = proposed
    .map((p, i) => ({ p, c: cMap.get(guestKey(p)), idx: i }))
    .filter(({ c, p }) => c && JSON.stringify(c) !== JSON.stringify(p));

  if (added.length === 0 && removed.length === 0 && modified.length === 0) {
    return <p className="text-xs text-muted-foreground italic">Nessuna modifica agli ospiti</p>;
  }

  return (
    <div className="space-y-2.5">
      {added.map((g, i) => (
        <div key={`add-${i}`} className="rounded-md border border-emerald-200 bg-emerald-50/50 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-xs font-semibold text-emerald-800">Nuovo ospite: {guestLabel(g, i)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            {Object.entries(GUEST_FIELD_LABELS).map(([k, label]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-medium text-right">{fmtVal(k === "id_type" ? "id_type" : k, (g as any)[k])}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {removed.map((g, i) => (
        <div key={`rem-${i}`} className="rounded-md border border-red-200 bg-red-50/50 p-2.5">
          <div className="flex items-center gap-1.5">
            <UserMinus className="w-3.5 h-3.5 text-red-700" />
            <span className="text-xs font-semibold text-red-800 line-through">Rimosso: {guestLabel(g, i)}</span>
          </div>
        </div>
      ))}
      {modified.map(({ c, p, idx }) => (
        <div key={`mod-${idx}`} className="rounded-md border border-amber-200 bg-amber-50/40 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <UserCog className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-xs font-semibold text-amber-800">Modifiche a: {guestLabel(p, idx)}</span>
          </div>
          {Object.keys(GUEST_FIELD_LABELS).map((k) => (
            <GuestFieldDiff key={k} label={GUEST_FIELD_LABELS[k]} fieldKey={k} current={c?.[k]} proposed={(p as any)[k]} />
          ))}
        </div>
      ))}
    </div>
  );
}

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

  const scalarKeys = keys.filter((k) => k !== "additional_guests");
  const showGuests = keys.includes("additional_guests");

  return (
    <div className="space-y-3">
      {scalarKeys.length > 0 && (
        <div className="space-y-2">
          {scalarKeys.map((k) => (
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
      )}
      {showGuests && (
        <div>
          <p className="font-sans text-xs uppercase tracking-wide text-muted-foreground mb-2">Ospiti aggiuntivi</p>
          <GuestsDiff
            current={Array.isArray(current?.additional_guests) ? current.additional_guests : []}
            proposed={Array.isArray(proposed?.additional_guests) ? proposed.additional_guests : []}
          />
        </div>
      )}
    </div>
  );
}
