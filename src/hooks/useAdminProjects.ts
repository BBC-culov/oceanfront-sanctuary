import { normalizeProject, type ProjectPayload } from "@/lib/dataTypes";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjectRow {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  price_label: string | null;
  images: string[];
  video_url: string | null;
  brochure_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  apple_maps_url: string | null;
  included_services: string[];
  purchase_info: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  published: boolean;
  display_order: number;
}

/** Data access for the admin projects screen. */
export function useAdminProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    setLoading(false);
    if (error) {
      toast.error("Errore caricamento progetti");
      return;
    }
    setProjects((data ?? []).map(normalizeProject));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Returns true when the slug is already used by another project. */
  const isSlugTaken = useCallback(async (slug: string, currentId?: string) => {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    return !!data && data.id !== currentId;
  }, []);

  const saveProject = useCallback(
    async (payload: ProjectPayload, editingId?: string): Promise<boolean> => {
      const { error } = editingId
        ? await supabase.from("projects").update(payload).eq("id", editingId)
        : await supabase.from("projects").insert(payload);
      if (error) {
        toast.error(`Errore: ${error.message}`);
        return false;
      }
      toast.success("Progetto salvato");
      await load();
      return true;
    },
    [load]
  );

  const togglePublished = useCallback(
    async (p: ProjectRow) => {
      const { error } = await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
      if (error) {
        toast.error("Errore");
        return;
      }
      await load();
    },
    [load]
  );

  const deleteProject = useCallback(
    async (p: ProjectRow) => {
      const { error } = await supabase.from("projects").delete().eq("id", p.id);
      if (error) {
        toast.error("Errore");
        return;
      }
      toast.success("Progetto eliminato");
      await load();
    },
    [load]
  );

  return { projects, loading, load, isSlugTaken, saveProject, togglePublished, deleteProject };
}
