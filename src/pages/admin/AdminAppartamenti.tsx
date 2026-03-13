import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ApartmentWizard from "@/components/admin/ApartmentWizard";

interface ApartmentRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  price_per_night: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  services: string[];
  address: string | null;
  is_active: boolean;
}

const emptyApt: Omit<ApartmentRow, "id"> = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  category: "residence",
  price_per_night: 0,
  guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  sqm: 50,
  services: [],
  address: "",
  is_active: true,
};

const AdminAppartamenti = () => {
  const [apartments, setApartments] = useState<ApartmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApartmentRow | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchApartments = async () => {
    const { data } = await supabase.from("apartments").select("*").order("name");
    setApartments(
      (data ?? []).map((a: any) => ({
        ...a,
        services: Array.isArray(a.services) ? a.services : [],
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchApartments(); }, []);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (apt: ApartmentRow) => {
    setCreating(false);
    setEditing(apt);
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  const handleSave = async (form: Omit<ApartmentRow, "id">, servicesInput: string, images: string[]) => {
    const services = servicesInput.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, services, images } as any;

    if (creating) {
      const { error } = await supabase.from("apartments").insert(payload);
      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Appartamento creato" });
    } else if (editing) {
      const { error } = await supabase.from("apartments").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Appartamento aggiornato" });
    }
    closeForm();
    fetchApartments();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"?`)) return;
    const { error } = await supabase.from("apartments").delete().eq("id", id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setApartments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Appartamento eliminato" });
    }
  };

  const isFormOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground">Appartamenti</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">Gestisci gli appartamenti</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreate}
          className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo
        </motion.button>
      </div>

      {/* Wizard */}
      <AnimatePresence>
        {isFormOpen && (
          <ApartmentWizard
            initialData={editing ? { ...editing } : emptyApt}
            initialServices={editing ? editing.services.join(", ") : ""}
            initialImages={editing ? (Array.isArray((editing as any).images) ? (editing as any).images : []) : []}
            isEditing={!!editing}
            editName={editing?.name}
            editId={editing?.id}
            onSave={handleSave}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>

      {/* List */}
      <Card className="bg-background">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Caricamento...</p>
          ) : apartments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nessun appartamento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Nome", "Categoria", "Prezzo/notte", "Ospiti", "Stato", "Azioni"].map((h) => (
                      <th key={h} className="text-left font-sans text-xs uppercase tracking-wider text-muted-foreground py-3 px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apartments.map((apt) => (
                    <tr key={apt.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-sans text-sm font-medium text-foreground">{apt.name}</p>
                        <p className="font-sans text-xs text-muted-foreground">{apt.slug}</p>
                      </td>
                      <td className="py-3 px-2 font-sans text-sm text-muted-foreground capitalize">{apt.category}</td>
                      <td className="py-3 px-2 font-sans text-sm text-foreground">€{apt.price_per_night}</td>
                      <td className="py-3 px-2 font-sans text-sm text-muted-foreground">{apt.guests}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-block font-sans text-xs px-2.5 py-1 rounded-full ${
                          apt.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {apt.is_active ? "Attivo" : "Disattivato"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(apt)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                            title="Modifica"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id, apt.name)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppartamenti;
