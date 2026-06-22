import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Phone, Trash2, Check, Circle, Search, Inbox, MailOpen, Filter, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
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

type ReadFilter = "all" | "unread" | "read";

const AdminRichiesteProgetti = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

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

  const markAllRead = async () => {
    const unreadIds = filtered.filter((i) => !i.read).map((i) => i.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase.from("project_inquiries" as any).update({ read: true }).in("id", unreadIds);
    if (error) { toast.error("Errore"); return; }
    toast.success(`${unreadIds.length} richieste segnate come lette`);
    load();
  };

  const remove = async (i: Inquiry) => {
    if (!confirm("Eliminare la richiesta?")) return;
    const { error } = await supabase.from("project_inquiries" as any).delete().eq("id", i.id);
    if (error) { toast.error("Errore"); return; }
    toast.success("Richiesta eliminata");
    load();
  };

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    inquiries.forEach((i) => {
      if (i.project_id && i.project?.title) map.set(i.project_id, i.project.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [inquiries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inquiries.filter((i) => {
      if (readFilter === "unread" && i.read) return false;
      if (readFilter === "read" && !i.read) return false;
      if (projectFilter !== "all" && i.project_id !== projectFilter) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.phone ?? "").toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        (i.project?.title ?? "").toLowerCase().includes(q)
      );
    });
  }, [inquiries, search, readFilter, projectFilter]);

  const stats = useMemo(() => ({
    total: inquiries.length,
    unread: inquiries.filter((i) => !i.read).length,
    read: inquiries.filter((i) => i.read).length,
  }), [inquiries]);

  const clearFilters = () => {
    setSearch("");
    setReadFilter("all");
    setProjectFilter("all");
  };
  const hasFilters = search !== "" || readFilter !== "all" || projectFilter !== "all";

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1">Richieste Progetti</h1>
        <p className="font-sans text-sm text-muted-foreground">
          Richieste di informazioni ricevute dai potenziali acquirenti.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setReadFilter("all")}
          className={`border rounded-sm p-4 text-left transition-all ${readFilter === "all" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"}`}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
            <Inbox className="w-3 h-3" /> Totali
          </div>
          <div className="font-serif text-2xl">{stats.total}</div>
        </button>
        <button
          onClick={() => setReadFilter("unread")}
          className={`border rounded-sm p-4 text-left transition-all ${readFilter === "unread" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"}`}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
            <Circle className="w-3 h-3 fill-primary text-primary" /> Non lette
          </div>
          <div className="font-serif text-2xl text-primary">{stats.unread}</div>
        </button>
        <button
          onClick={() => setReadFilter("read")}
          className={`border rounded-sm p-4 text-left transition-all ${readFilter === "read" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"}`}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
            <MailOpen className="w-3 h-3" /> Lette
          </div>
          <div className="font-serif text-2xl">{stats.read}</div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, email, telefono, progetto o testo…"
            className="pl-9"
          />
        </div>
        {projects.length > 0 && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="md:w-64">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Progetto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i progetti</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hasFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-3 h-3 mr-1" /> Pulisci
          </Button>
        )}
        {stats.unread > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <Check className="w-3 h-3 mr-1" /> Segna lette
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Caricamento…</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground rounded-sm">
          {inquiries.length === 0 ? "Nessuna richiesta ricevuta." : "Nessun risultato per i filtri attivi."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => (
            <div
              key={i.id}
              className={`border rounded-sm bg-card overflow-hidden transition-all ${
                !i.read ? "border-primary/40 bg-primary/[0.02]" : "border-border"
              }`}
            >
              <div className={`flex ${!i.read ? "border-l-4 border-l-primary" : ""}`}>
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-serif text-lg">{i.name}</h3>
                        {!i.read && (
                          <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Nuova
                          </span>
                        )}
                      </div>
                      {i.project ? (
                        <p className="text-xs text-muted-foreground">
                          Progetto: <span className="font-medium text-foreground">{i.project.title}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Progetto eliminato</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5" title={format(new Date(i.created_at), "PPPp", { locale: it })}>
                        {formatDistanceToNow(new Date(i.created_at), { addSuffix: true, locale: it })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleRead(i)}>
                        {i.read ? (
                          <><Circle className="w-3 h-3 mr-1" /> Non letto</>
                        ) : (
                          <><Check className="w-3 h-3 mr-1" /> Letto</>
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(i)} className="text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm mb-3">
                    <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 hover:text-primary break-all">
                      <Mail className="w-3 h-3 flex-shrink-0" /> {i.email}
                    </a>
                    {i.phone && (
                      <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        <Phone className="w-3 h-3 flex-shrink-0" /> {i.phone}
                      </a>
                    )}
                  </div>
                  <p className="text-sm bg-secondary/40 p-3 rounded-sm whitespace-pre-line break-words">{i.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-6">
          {filtered.length} {filtered.length === 1 ? "richiesta" : "richieste"} mostrate
        </p>
      )}
    </div>
  );
};

export default AdminRichiesteProgetti;
