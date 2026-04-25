import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Building2, Eye, EyeOff, CheckCircle2, XCircle, CalendarRange, Star, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ApartmentWizard from "@/components/admin/ApartmentWizard";
import AvailabilityManagerDialog from "@/components/admin/AvailabilityManagerDialog";
import SortableApartmentCard from "@/components/admin/SortableApartmentCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  display_order?: number;
  is_featured?: boolean;
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
  const [availabilityFor, setAvailabilityFor] = useState<ApartmentRow | null>(null);

  const fetchApartments = async () => {
    const { data } = await supabase
      .from("apartments")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    setApartments(
      (data ?? []).map((a: any) => ({
        ...a,
        services: Array.isArray(a.services) ? a.services : [],
        images: Array.isArray(a.images) ? a.images : [],
        videos: Array.isArray(a.videos) ? a.videos : [],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchApartments();
    // No realtime subscription: data is refetched after every create/update/delete
    // performed in this page. A single admin works at a time, so a persistent
    // WebSocket would only consume realtime hours without practical benefit.
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

  const handleSave = async (form: Omit<ApartmentRow, "id">, servicesInput: string, images: string[], videos: string[]) => {
    const services = servicesInput.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, services, images, videos } as any;

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

  const toggleFeatured = async (apt: ApartmentRow) => {
    const next = !apt.is_featured;
    setApartments((prev) => prev.map((a) => a.id === apt.id ? { ...a, is_featured: next } : a));
    const { error } = await supabase.from("apartments").update({ is_featured: next }).eq("id", apt.id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      // rollback
      setApartments((prev) => prev.map((a) => a.id === apt.id ? { ...a, is_featured: !next } : a));
    } else {
      toast({ title: next ? "Aggiunto in evidenza" : "Rimosso dall'evidenza" });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const persistOrder = async (list: ApartmentRow[]) => {
    // Assign 10, 20, 30… to keep room for future inserts
    const updates = list.map((apt, idx) => ({ id: apt.id, display_order: (idx + 1) * 10 }));
    // Optimistic UI already applied; persist sequentially
    await Promise.all(
      updates.map((u) =>
        supabase.from("apartments").update({ display_order: u.display_order }).eq("id", u.id)
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent, isActiveTab: boolean) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceList = isActiveTab ? activeApartments : inactiveApartments;
    const oldIndex = sourceList.findIndex((a) => a.id === active.id);
    const newIndex = sourceList.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sourceList, oldIndex, newIndex);
    // Merge with the other list to update the global state
    const otherList = isActiveTab ? inactiveApartments : activeApartments;
    const updatedAll = isActiveTab ? [...reordered, ...otherList] : [...otherList, ...reordered];

    // Apply the new display_order locally
    const withOrder = updatedAll.map((a) => {
      const idx = reordered.findIndex((r) => r.id === a.id);
      return idx >= 0 ? { ...a, display_order: (idx + 1) * 10 } : a;
    });
    setApartments(withOrder);

    persistOrder(reordered).catch(() => {
      toast({ title: "Errore salvataggio ordine", variant: "destructive" });
      fetchApartments();
    });
  };

  const isFormOpen = creating || !!editing;

  const activeApartments = apartments.filter(a => a.is_active);
  const inactiveApartments = apartments.filter(a => !a.is_active);

  const renderApartmentGrid = (apts: ApartmentRow[], isActiveTab: boolean) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => handleDragEnd(e, isActiveTab)}
    >
      <SortableContext items={apts.map((a) => a.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apts.map((apt) => (
            <SortableApartmentCard
              key={apt.id}
              apt={apt}
              isActiveTab={isActiveTab}
              onEdit={openEdit}
              onAvailability={setAvailabilityFor}
              onToggleActive={toggleActive}
              onToggleFeatured={toggleFeatured}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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
            initialVideos={editing ? (editing.videos ?? []) : []}
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

      {/* Availability dialog */}
      <AvailabilityManagerDialog
        open={!!availabilityFor}
        onClose={() => setAvailabilityFor(null)}
        apartmentId={availabilityFor?.id ?? ""}
        apartmentName={availabilityFor?.name ?? ""}
      />
    </div>
  );
};

export default AdminAppartamenti;
