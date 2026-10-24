import { useAdminOwners } from "@/hooks/useAdminOwners";
import { motion, AnimatePresence } from "framer-motion";
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

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

const AdminProprietari = () => {
  const { isAmministratore, loading: roleLoading } = useAmministratoreCheck();
  const { owners, apartments, bookings, loading, search, setSearch, statusFilter, setStatusFilter, aptCountFilter, setAptCountFilter, assignOpen, setAssignOpen, selectedOwner, selectedApts, saving, fetchAll, statsByOwner, unassignedCount, openAssign, toggleApt, saveAssignments, filtered } = useAdminOwners(isAmministratore);

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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-sans"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-44 font-sans">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="active">Attivi</SelectItem>
            <SelectItem value="incomplete">Incompleti</SelectItem>
          </SelectContent>
        </Select>
        <Select value={aptCountFilter} onValueChange={(v: any) => setAptCountFilter(v)}>
          <SelectTrigger className="w-full sm:w-52 font-sans">
            <SelectValue placeholder="N. appartamenti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualsiasi numero</SelectItem>
            <SelectItem value="0">Nessun appartamento</SelectItem>
            <SelectItem value="1">1 appartamento</SelectItem>
            <SelectItem value="2+">2 o più</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all" || aptCountFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setStatusFilter("all"); setAptCountFilter("all"); }}
          >
            <X className="w-4 h-4 mr-1" /> Reset
          </Button>
        )}
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-sans text-sm font-semibold text-foreground truncate">
                              {o.first_name || o.last_name ? `${o.first_name} ${o.last_name}`.trim() : o.email}
                            </p>
                            <Badge
                              variant={st.apts.length > 0 ? "default" : "outline"}
                              className={`font-sans text-[9px] uppercase tracking-wider ${
                                st.apts.length > 0
                                  ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-emerald-500/30"
                                  : "border-amber-500/40 text-amber-600"
                              }`}
                            >
                              {st.apts.length > 0 ? "Attivo" : "Incompleto"}
                            </Badge>
                          </div>
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
