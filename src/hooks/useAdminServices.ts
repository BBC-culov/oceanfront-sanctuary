// Data + actions for the admin "Servizi extra" page (additional_services CRUD and ordering).
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sort_order: number;
  is_active: boolean;
}

export const emptyService: Omit<ServiceRow, "id"> = {
  name: "", description: "", price: 0, sort_order: 0, is_active: true,
};

export function useAdminServices() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState<Omit<ServiceRow, "id">>(emptyService);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const handleReorder = async (newOrder: ServiceRow[]) => {
    setServices(newOrder);
    setReordering(true);
    try {
      const updates = newOrder.map((s, i) =>
        supabase.from("additional_services").update({ sort_order: i }).eq("id", s.id)
      );
      await Promise.all(updates);
    } catch (err: any) {
      toast.error("Errore riordino", { description: err.message });
      fetchServices();
    } finally {
      setReordering(false);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("additional_services")
      .select("*")
      .order("sort_order");
    if (error) {
      toast.error("Errore", { description: error.message });
    } else {
      setServices((data || []) as ServiceRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyService, sort_order: services.length });
    setDialogOpen(true);
  };

  const openEdit = (s: ServiceRow) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description || "", price: s.price, sort_order: s.sort_order, is_active: s.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome obbligatorio");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("additional_services")
          .update({ name: form.name, description: form.description || null, price: form.price, sort_order: form.sort_order, is_active: form.is_active })
          .eq("id", editing.id);
        if (error) throw error;
        toast("Servizio aggiornato");
      } else {
        const { error } = await supabase
          .from("additional_services")
          .insert({ name: form.name, description: form.description || null, price: form.price, sort_order: form.sort_order, is_active: form.is_active });
        if (error) throw error;
        toast("Servizio creato");
      }
      setDialogOpen(false);
      fetchServices();
    } catch (err: any) {
      toast.error("Errore", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo servizio?")) return;
    const { error } = await supabase.from("additional_services").delete().eq("id", id);
    if (error) {
      toast.error("Errore", { description: error.message });
    } else {
      toast("Servizio eliminato");
      fetchServices();
    }
  };

  const toggleActive = async (s: ServiceRow) => {
    const { error } = await supabase
      .from("additional_services")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    if (error) {
      toast.error("Errore", { description: error.message });
    } else {
      fetchServices();
    }
  };

  return { services, loading, dialogOpen, setDialogOpen, editing, form, setForm, saving, reordering, handleReorder, openNew, openEdit, handleSave, handleDelete, toggleActive };
}
