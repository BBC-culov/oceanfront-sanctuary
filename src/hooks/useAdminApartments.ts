import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BUCKETS, extractStoragePath, removeFiles } from "@/lib/mediaStorage";

export interface ApartmentRow {
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

/**
 * Data access for the admin apartments screen: listing, saving, activation,
 * featuring, ordering and deletion (including storage cleanup).
 * The UI keeps its optimistic local state; only backend access lives here.
 */
export function useAdminApartments() {
  const queryClient = useQueryClient();
  const [apartments, setApartments] = useState<ApartmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const invalidatePublicCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["apartments-public"] });
    queryClient.invalidateQueries({ queryKey: ["apartment-public"] });
  }, [queryClient]);

  const fetchApartments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchApartments();
    // No realtime subscription: data is refetched after every create/update/delete
    // performed in this page. A single admin works at a time, so a persistent
    // WebSocket would only consume realtime hours without practical benefit.
  }, [fetchApartments]);

  const saveApartment = useCallback(
    async (payload: any, editingId?: string): Promise<boolean> => {
      const { error } = editingId
        ? await supabase.from("apartments").update(payload).eq("id", editingId)
        : await supabase.from("apartments").insert(payload);
      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: editingId ? "Appartamento aggiornato" : "Appartamento creato" });
      await fetchApartments();
      invalidatePublicCache();
      return true;
    },
    [fetchApartments, invalidatePublicCache]
  );

  const deleteApartment = useCallback(
    async (id: string) => {
      const apt = apartments.find((a) => a.id === id);

      // Best-effort cleanup of storage assets BEFORE deleting the row.
      // Failures are non-blocking: we still proceed with DB delete and
      // surface a non-destructive warning so the admin knows.
      const imagePaths = (apt?.images ?? [])
        .map((u) => extractStoragePath(u, BUCKETS.images))
        .filter((p): p is string => !!p);
      const videoPaths = (apt?.videos ?? [])
        .map((u) => extractStoragePath(u, BUCKETS.videos))
        .filter((p): p is string => !!p);

      const cleanupErrors: string[] = [];
      const imgErr = await removeFiles(BUCKETS.images, imagePaths);
      if (imgErr) cleanupErrors.push(`immagini: ${imgErr}`);
      const vidErr = await removeFiles(BUCKETS.videos, videoPaths);
      if (vidErr) cleanupErrors.push(`video: ${vidErr}`);

      const { error } = await supabase.from("apartments").delete().eq("id", id);
      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return;
      }
      setApartments((prev) => prev.filter((a) => a.id !== id));
      if (cleanupErrors.length > 0) {
        toast({
          title: "Appartamento eliminato",
          description: `Alcuni file non sono stati rimossi dallo storage (${cleanupErrors.join("; ")})`,
        });
      } else {
        toast({ title: "Appartamento eliminato" });
      }
      invalidatePublicCache();
    },
    [apartments, invalidatePublicCache]
  );

  const toggleActive = useCallback(
    async (apt: ApartmentRow) => {
      const { error } = await supabase.from("apartments").update({ is_active: !apt.is_active }).eq("id", apt.id);
      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return;
      }
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, is_active: !a.is_active } : a)));
      toast({ title: apt.is_active ? "Disattivato" : "Attivato" });
      invalidatePublicCache();
    },
    [invalidatePublicCache]
  );

  const toggleFeatured = useCallback(
    async (apt: ApartmentRow) => {
      const next = !apt.is_featured;
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, is_featured: next } : a)));
      const { error } = await supabase.from("apartments").update({ is_featured: next }).eq("id", apt.id);
      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        // rollback
        setApartments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, is_featured: !next } : a)));
        return;
      }
      toast({ title: next ? "Aggiunto in evidenza" : "Rimosso dall'evidenza" });
      invalidatePublicCache();
    },
    [invalidatePublicCache]
  );

  const persistOrder = useCallback(async (list: ApartmentRow[]) => {
    // Assign 10, 20, 30… to keep room for future inserts
    await Promise.all(
      list.map((apt, idx) =>
        supabase.from("apartments").update({ display_order: (idx + 1) * 10 }).eq("id", apt.id)
      )
    );
  }, []);

  return {
    apartments,
    setApartments,
    loading,
    fetchApartments,
    invalidatePublicCache,
    saveApartment,
    deleteApartment,
    toggleActive,
    toggleFeatured,
    persistOrder,
  };
}
