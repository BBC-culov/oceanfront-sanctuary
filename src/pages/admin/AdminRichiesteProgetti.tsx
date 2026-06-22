import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Phone, Trash2, Check, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface Inquiry {
  id: string;
  project_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
  project?: { title: string; slug: string } | null;
}

const AdminRichiesteProgetti = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_inquiries" as any)
      .select("*, project:projects(title, slug)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error("Errore caricamento"); return; }
    setInquiries((data ?? []) as any);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (i: Inquiry) => {
    const { error } = await supabase.from("project_inquiries" as any).update({ read: !i.read }).eq("id", i.id);
    if (error) { toast.error("Errore"); return; }
    load();
  };

  const remove = async (i: Inquiry) => {
    if (!confirm("Eliminare la richiesta?")) return;
    const { error } = await supabase.from("project_inquiries" as any).delete().eq("id", i.id);
    if (error) { toast.error("Errore"); return; }
    load();
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <h1 className="font-serif text-3xl mb-1">Richieste Progetti</h1>
      <p className="font-sans text-sm text-muted-foreground mb-8">
        Richieste di informazioni ricevute dai potenziali acquirenti.
      </p>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento…</div>
      ) : inquiries.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
          Nessuna richiesta ricevuta.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div
              key={i.id}
              className={`border border-border p-5 rounded-sm bg-card ${!i.read ? "border-l-4 border-l-primary" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-serif text-lg">{i.name}</h3>
                  {i.project && (
                    <p className="text-xs text-muted-foreground">
                      Progetto: <span className="font-medium">{i.project.title}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(i.created_at), { addSuffix: true, locale: it })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleRead(i)}>
                    {i.read ? <><Circle className="w-3 h-3 mr-1" /> Non letto</> : <><Check className="w-3 h-3 mr-1" /> Letto</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(i)} className="text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                  <Mail className="w-3 h-3" /> {i.email}
                </a>
                {i.phone && (
                  <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Phone className="w-3 h-3" /> {i.phone}
                  </a>
                )}
              </div>
              <p className="text-sm bg-secondary/40 p-3 rounded whitespace-pre-line">{i.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRichiesteProgetti;
