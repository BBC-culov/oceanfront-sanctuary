import { useAdminServices } from "@/hooks/useAdminServices";
import { motion, Reorder } from "framer-motion";
import { Plus, Pencil, Trash2, Sparkles, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminServizi = () => {
  const { services, loading, dialogOpen, setDialogOpen, editing, form, setForm, saving, reordering, handleReorder, openNew, openEdit, handleSave, handleDelete, toggleActive } = useAdminServices();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Servizi Aggiuntivi</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Gestisci i servizi extra disponibili per le prenotazioni
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-sans text-xs tracking-[0.1em] uppercase px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo servizio
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-sans text-sm">Nessun servizio aggiuntivo configurato</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={services} onReorder={handleReorder} className="space-y-2">
          {services.map((s, i) => (
            <Reorder.Item
              key={s.id}
              value={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50 }}
              className={`group flex items-center gap-4 p-4 border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                s.is_active
                  ? "border-border/50 bg-card/40 hover:border-primary/30"
                  : "border-border/30 bg-muted/20 opacity-60"
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-sans text-sm font-medium text-foreground truncate">{s.name}</p>
                  {!s.is_active && (
                    <span className="font-sans text-[10px] tracking-wide uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                      Disattivo
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="font-sans text-xs text-muted-foreground mt-0.5 truncate">{s.description}</p>
                )}
              </div>

              <span className="font-sans text-sm font-semibold text-foreground flex-shrink-0">
                €{s.price}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleActive(s)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  title={s.is_active ? "Disattiva" : "Attiva"}
                >
                  {s.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(s)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(s.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editing ? "Modifica servizio" : "Nuovo servizio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5 block">
                Nome <span className="text-primary/70">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="es. Transfer aeroporto"
                className="bg-card/50 border-border/60 text-sm h-10"
              />
            </div>
            <div>
              <label className="font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5 block">
                Descrizione
              </label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Breve descrizione del servizio..."
                className="bg-card/50 border-border/60 text-sm min-h-[70px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5 block">
                  Prezzo (€) <span className="text-primary/70">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="bg-card/50 border-border/60 text-sm h-10"
                />
              </div>
              <div>
                <label className="font-sans text-[11px] tracking-wide text-muted-foreground mb-1.5 block">
                  Ordine
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="bg-card/50 border-border/60 text-sm h-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-sans text-[11px] tracking-wide text-muted-foreground">Attivo</label>
              <button
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? "bg-primary" : "bg-muted"}`}
              >
                <motion.div
                  animate={{ x: form.is_active ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground font-sans text-xs tracking-[0.1em] uppercase py-3 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvataggio..." : editing ? "Aggiorna" : "Crea servizio"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminServizi;
