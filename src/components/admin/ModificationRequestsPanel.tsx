// Admin panel: review pending modification requests for a booking.
// Approve (with optional Stripe payment link) or reject (with reason).
import { useEffect, useState } from "react";
import { Loader2, Check, X, AlertCircle, Link as LinkIcon, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { extractEdgeError } from "@/lib/edgeError";
import ModificationDiff from "./ModificationDiff";

interface Props {
  bookingId: string;
  originalStatus?: string;
  onChanged?: () => void;
}

export default function ModificationRequestsPanel({ bookingId, originalStatus = "confirmed", onChanged }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [genLink, setGenLink] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("booking_modification_requests")
      .select("*").eq("booking_id", bookingId)
      .order("created_at", { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [bookingId]);

  const review = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      const { data, error } = await supabase.functions.invoke("review-booking-modification", {
        body: {
          request_id: id,
          action,
          admin_note: adminNote[id] || null,
          rejection_reason: action === "reject" ? (rejectReason[id] || null) : null,
          generate_modification_link: action === "approve" ? !!genLink[id] : false,
          restore_status: originalStatus,
        },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      toast({ title: action === "approve" ? "Modifica approvata" : "Richiesta rifiutata" });
      await load();
      onChanged?.();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Errore", variant: "destructive" });
    } finally { setBusy(null); }
  };

  if (loading) return <div className="p-4"><Loader2 className="w-4 h-4 animate-spin" /></div>;
  if (requests.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-violet-200 rounded-sm shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-violet-200 bg-violet-50">
        <AlertCircle className="w-4 h-4 text-violet-700" />
        <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-violet-900 font-medium">
          Richieste di modifica ({requests.filter(r => r.status === "pending").length} attive)
        </h3>
      </div>
      <div className="p-5 space-y-5">
        {requests.map((r) => (
          <div key={r.id} className={`rounded-md border p-4 ${r.status === "pending" ? "border-violet-300 bg-violet-50/40" : "border-border bg-secondary/20"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`font-sans text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-sm ${
                r.status === "pending" ? "bg-violet-200 text-violet-800" :
                r.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                "bg-red-100 text-red-700"
              }`}>{r.status}</span>
              <span className="font-sans text-[10px] text-muted-foreground">
                {new Date(r.created_at).toLocaleString("it-IT")}
              </span>
            </div>

            <ModificationDiff current={r.current_data ?? {}} proposed={r.requested_changes ?? {}} />

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-border/40">
                <p className="text-muted-foreground">Totale attuale</p>
                <p className="font-semibold">€{Number(r.current_total).toFixed(2)}</p>
              </div>
              <div className="bg-white p-2 rounded border border-border/40">
                <p className="text-muted-foreground">Nuovo totale</p>
                <p className="font-semibold">€{Number(r.new_total).toFixed(2)}</p>
              </div>
              <div className="bg-white p-2 rounded border border-border/40">
                <p className="text-muted-foreground">Differenza</p>
                <p className={`font-semibold ${Number(r.price_diff) > 0 ? "text-amber-700" : Number(r.price_diff) < 0 ? "text-emerald-700" : ""}`}>
                  {Number(r.price_diff) >= 0 ? "+" : ""}€{Number(r.price_diff).toFixed(2)}
                </p>
              </div>
            </div>

            {r.customer_note && (
              <p className="mt-3 text-sm italic text-muted-foreground">"{r.customer_note}"</p>
            )}

            {r.status === "pending" && (
              <div className="mt-4 space-y-3 border-t border-border/40 pt-4">
                <textarea value={adminNote[r.id] ?? ""} onChange={(e) => setAdminNote({ ...adminNote, [r.id]: e.target.value })}
                  placeholder="Nota per il cliente (opzionale)" rows={2}
                  className="w-full px-3 py-2 rounded border border-border text-sm" />
                {Number(r.price_diff) > 0 && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!genLink[r.id]} onChange={(e) => setGenLink({ ...genLink, [r.id]: e.target.checked })} />
                    Genera link Stripe per la differenza (48h)
                  </label>
                )}
                <input value={rejectReason[r.id] ?? ""} onChange={(e) => setRejectReason({ ...rejectReason, [r.id]: e.target.value })}
                  placeholder="Motivo rifiuto (se rifiuti)"
                  className="w-full h-10 px-3 rounded border border-border text-sm" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => review(r.id, "reject")} disabled={busy === r.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-destructive/40 text-destructive font-sans text-xs uppercase tracking-wide hover:bg-destructive/5 disabled:opacity-50">
                    <X className="w-3.5 h-3.5" /> Rifiuta
                  </button>
                  <button onClick={() => review(r.id, "approve")} disabled={busy === r.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 text-white font-sans text-xs uppercase tracking-wide hover:bg-emerald-700 disabled:opacity-50">
                    {busy === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Approva
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
