import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useAmministratoreCheck } from "@/hooks/useAmministratoreCheck";
import {
  Home, Loader2, Search, Shield, Mail, Phone, Building2,
  CalendarDays, Euro, Settings2, Check, X, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface OwnerUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  roles: string[];
  created_at: string;
}

interface Apartment {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  is_active: boolean;
}

interface BookingRow {
  id: string;
  apartment_id: string;
  total_price: number | null;
  amount_paid: number | null;
  status: string;
  check_in: string;
  check_out: string;
}

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

const AdminProprietari = () => {
  const { isAmministratore, loading: roleLoading } = useAmministratoreCheck();
  const [owners, setOwners] = useState<OwnerUser[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "incomplete">("all");
  const [aptCountFilter, setAptCountFilter] = useState<"all" | "0" | "1" | "2+">("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerUser | null>(null);
  const [selectedApts, setSelectedApts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: usersData, error: usersErr }, aptRes, bkRes] = await Promise.all([
        supabase.functions.invoke("manage-admin", { body: { action: "list" } }),
        supabase.from("apartments").select("id, name, slug, owner_id, is_active").order("name"),
        supabase.from("bookings").select("id, apartment_id, total_price, amount_paid, status, check_in, check_out"),
      ]);
      if (usersErr) throw usersErr;
      if (aptRes.error) throw aptRes.error;
      if (bkRes.error) throw bkRes.error;

      const onlyOwners = (usersData?.users || []).filter((u: OwnerUser) => u.roles.includes("proprietario"));
      setOwners(onlyOwners);
      setApartments((aptRes.data || []) as Apartment[]);
      setBookings((bkRes.data || []) as BookingRow[]);
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAmministratore) fetchAll();
  }, [isAmministratore, fetchAll]);

  const statsByOwner = useMemo(() => {
    const map: Record<string, {
      apts: Apartment[];
      bookings: BookingRow[];
      revenue: number;
      received: number;
      confirmed: number;
    }> = {};
    for (const o of owners) {
      const apts = apartments.filter(a => a.owner_id === o.id);
      const aptIds = new Set(apts.map(a => a.id));
      const obks = bookings.filter(b => aptIds.has(b.apartment_id));
      const confirmed = obks.filter(b => b.status === "confirmed");
      map[o.id] = {
        apts,
        bookings: obks,
        revenue: confirmed.reduce((s, b) => s + Number(b.total_price || 0), 0),
        received: confirmed.reduce((s, b) => s + Number(b.amount_paid || 0), 0),
        confirmed: confirmed.length,
      };
    }
    return map;
  }, [owners, apartments, bookings]);

  const unassignedCount = apartments.filter(a => !a.owner_id).length;

  const openAssign = (owner: OwnerUser) => {
    setSelectedOwner(owner);
    setSelectedApts(new Set(apartments.filter(a => a.owner_id === owner.id).map(a => a.id)));
    setAssignOpen(true);
  };

  const toggleApt = (id: string) => {
    setSelectedApts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveAssignments = async () => {
    if (!selectedOwner) return;
    setSaving(true);
    try {
      const current = new Set(apartments.filter(a => a.owner_id === selectedOwner.id).map(a => a.id));
      const toAdd = [...selectedApts].filter(id => !current.has(id));
      const toRemove = [...current].filter(id => !selectedApts.has(id));

      if (toAdd.length) {
        const { error } = await supabase
          .from("apartments")
          .update({ owner_id: selectedOwner.id })
          .in("id", toAdd);
        if (error) throw error;
      }
      if (toRemove.length) {
        const { error } = await supabase
          .from("apartments")
          .update({ owner_id: null })
          .in("id", toRemove);
        if (error) throw error;
      }

      toast({
        title: "Assegnazioni aggiornate",
        description: `${selectedApts.size} appartamento/i assegnati a ${selectedOwner.email}.`,
      });
      setAssignOpen(false);
      fetchAll();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = owners.filter(o => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      o.email.toLowerCase().includes(q) ||
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(q);

    const count = statsByOwner[o.id]?.apts.length ?? 0;
    const isActive = count > 0;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "incomplete" && !isActive);

    const matchesAptCount =
      aptCountFilter === "all" ||
      (aptCountFilter === "0" && count === 0) ||
      (aptCountFilter === "1" && count === 1) ||
      (aptCountFilter === "2+" && count >= 2);

    return matchesSearch && matchesStatus && matchesAptCount;
  });

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAmministratore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 gap-4 text-center"
      >
        <Shield className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="font-sans text-xl font-semibold text-foreground">Accesso Riservato</h2>
        <p className="font-sans text-sm text-muted-foreground max-w-md">
          Questa sezione è accessibile solo agli account con ruolo Amministratore.
        </p>
      </motion.div>
    );
  }

  const totals = {
    owners: owners.length,
    assignedApts: apartments.filter(a => a.owner_id).length,
    revenue: Object.values(statsByOwner).reduce((s, v) => s + v.revenue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            Gestione Proprietari
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Assegna appartamenti ai proprietari e monitora le loro performance
          </p>
        </div>
      </motion.div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Proprietari", value: totals.owners, icon: Users },
          { label: "Appartamenti assegnati", value: `${totals.assignedApts}/${apartments.length}`, icon: Building2 },
          { label: "Non assegnati", value: unassignedCount, icon: Settings2, alert: unassignedCount > 0 },
          { label: "Ricavi totali", value: fmtEUR(totals.revenue), icon: TrendingUp },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-4 ${s.alert ? "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground">{s.label}</p>
                  <p className="font-sans text-xl font-semibold text-foreground mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-5 h-5 ${s.alert ? "text-amber-500" : "text-muted-foreground/50"}`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca proprietario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 font-sans"
        />
      </div>

      {/* Owner cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Home className="w-10 h-10 text-muted-foreground/30" />
          <p className="font-sans text-sm text-muted-foreground">
            {search ? "Nessun proprietario trovato" : "Nessun proprietario registrato. Crealo da Gestione Admin."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((o, i) => {
              const st = statsByOwner[o.id] || { apts: [], bookings: [], revenue: 0, received: 0, confirmed: 0 };
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-5 space-y-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Home className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-semibold text-foreground truncate">
                            {o.first_name || o.last_name ? `${o.first_name} ${o.last_name}`.trim() : o.email}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="font-sans text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 shrink-0" /> {o.email}
                            </span>
                            {o.phone && (
                              <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {o.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openAssign(o)} className="gap-2 shrink-0">
                        <Settings2 className="w-3.5 h-3.5" />
                        Assegna
                      </Button>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                      <div className="text-center">
                        <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Apt.</p>
                        <p className="font-sans text-base font-semibold text-foreground">{st.apts.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Pren.</p>
                        <p className="font-sans text-base font-semibold text-foreground">{st.confirmed}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Ricavi</p>
                        <p className="font-sans text-sm font-semibold text-foreground">{fmtEUR(st.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Incassati</p>
                        <p className="font-sans text-sm font-semibold text-emerald-600">{fmtEUR(st.received)}</p>
                      </div>
                    </div>

                    {/* Apartments */}
                    {st.apts.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {st.apts.map(a => (
                          <Badge key={a.id} variant="secondary" className="font-sans text-[10px]">
                            <Building2 className="w-3 h-3 mr-1" />
                            {a.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="font-sans text-xs text-muted-foreground italic">
                        Nessun appartamento assegnato
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Assegna appartamenti
            </DialogTitle>
            <DialogDescription className="font-sans text-sm">
              Seleziona gli appartamenti da assegnare a{" "}
              <span className="font-medium text-foreground">{selectedOwner?.email}</span>.
              Un appartamento può avere un solo proprietario.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh] pr-3">
            <div className="space-y-2 py-2">
              {apartments.map(a => {
                const checked = selectedApts.has(a.id);
                const ownedByOther = a.owner_id && a.owner_id !== selectedOwner?.id;
                const otherOwner = ownedByOther ? owners.find(o => o.id === a.owner_id) : null;
                return (
                  <label
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleApt(a.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-foreground">{a.name}</p>
                      {ownedByOther && !checked && (
                        <p className="font-sans text-[11px] text-amber-600 mt-0.5">
                          Attualmente di {otherOwner?.email ?? "altro proprietario"} — verrà riassegnato
                        </p>
                      )}
                      {!a.is_active && (
                        <p className="font-sans text-[11px] text-muted-foreground mt-0.5">Inattivo</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={saving}>
              <X className="w-4 h-4 mr-1" /> Annulla
            </Button>
            <Button onClick={saveAssignments} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProprietari;
