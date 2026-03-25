import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Building2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
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
  images?: string[];
  videos?: string[];
  map_query?: string | null;
  check_in_time: string;
  check_out_time: string;
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
  map_query: "",
  check_in_time: "15:00",
  check_out_time: "10:00",
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
        images: Array.isArray(a.images) ? a.images : [],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchApartments();

    // Realtime subscription
    const channel = supabase
      .channel("apartments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "apartments" },
        () => {
          fetchApartments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const toggleActive = async (apt: ApartmentRow) => {
    const { error } = await supabase.from("apartments").update({ is_active: !apt.is_active }).eq("id", apt.id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setApartments((prev) => prev.map((a) => a.id === apt.id ? { ...a, is_active: !a.is_active } : a));
      toast({ title: apt.is_active ? "Disattivato" : "Attivato" });
    }
  };

  const isFormOpen = creating || !!editing;

  const activeApartments = apartments.filter(a => a.is_active);
  const inactiveApartments = apartments.filter(a => !a.is_active);

  const renderApartmentGrid = (apts: ApartmentRow[], isActiveTab: boolean) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {apts.map((apt, i) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            layout
          >
            <Card className={`bg-background overflow-hidden group hover:shadow-lg transition-all duration-300 ${!isActiveTab ? 'opacity-70' : ''}`}>
              {/* Image cover */}
              <div className="relative h-36 bg-muted overflow-hidden">
                {apt.images && apt.images.length > 0 ? (
                  <motion.img
                    src={apt.images[0]}
                    alt={apt.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-muted-foreground/20" />
                  </div>
                )}
                {/* Category */}
                <div className="absolute bottom-2 left-2">
                  <span className="inline-block font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground">
                    {apt.category}
                  </span>
                </div>
              </div>

              <CardContent className="pt-4 pb-4">
                <h3 className="font-serif text-lg text-foreground">{apt.name}</h3>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">{apt.slug}</p>

                <div className="flex items-center gap-3 mt-3 font-sans text-xs text-muted-foreground">
                  <span>€{apt.price_per_night}/notte</span>
                  <span className="text-border">·</span>
                  <span>{apt.guests} ospiti</span>
                  <span className="text-border">·</span>
                  <span>{apt.sqm}mq</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEdit(apt)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                    title="Modifica"
                  >
                    <Pencil className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleActive(apt)}
                    className={`p-2 transition-colors rounded-md ${
                      isActiveTab 
                        ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                        : "text-muted-foreground hover:text-success hover:bg-success/10"
                    }`}
                    title={isActiveTab ? "Disattiva" : "Attiva"}
                  >
                    {isActiveTab ? <EyeOff className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(apt.id, apt.name)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 ml-auto"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderEmptyState = (isActiveTab: boolean) => (
    <Card className="bg-background">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          {isActiveTab ? (
            <CheckCircle2 className="w-12 h-12 text-primary/30 mx-auto mb-3" />
          ) : (
            <XCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          )}
          <p className="text-sm text-muted-foreground">
            {isActiveTab ? "Nessun appartamento attivo" : "Nessun appartamento disattivato"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-serif text-3xl font-light text-foreground">Appartamenti</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Gestisci gli appartamenti · <span className="text-primary">{apartments.length}</span> totali
            <span className="text-border"> · </span>
            <span className="text-success">{activeApartments.length} attivi</span>
            <span className="text-border"> · </span>
            <span className="text-muted-foreground">{inactiveApartments.length} disattivati</span>
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreate}
          className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-5 py-2.5 hover:bg-primary/90 transition-colors rounded-md"
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
            initialImages={editing ? (editing.images ?? []) : []}
            isEditing={!!editing}
            editName={editing?.name}
            editId={editing?.id}
            onSave={handleSave}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-48 bg-muted/30 rounded-lg border border-border"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Attivi
              {activeApartments.length > 0 && (
                <span className="ml-1 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                  {activeApartments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Disattivati
              {inactiveApartments.length > 0 && (
                <span className="ml-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {inactiveApartments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            {activeApartments.length === 0 
              ? renderEmptyState(true) 
              : renderApartmentGrid(activeApartments, true)}
          </TabsContent>
          
          <TabsContent value="inactive" className="mt-0">
            {inactiveApartments.length === 0 
              ? renderEmptyState(false) 
              : renderApartmentGrid(inactiveApartments, false)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminAppartamenti;
