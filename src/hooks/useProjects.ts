import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectImage { url: string }

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  price_label: string | null;
  images: string[];
  video_url: string | null;
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
  created_at: string;
  updated_at: string;
}

function normalize(row: any): Project {
  return {
    ...row,
    images: Array.isArray(row.images) ? row.images : [],
    included_services: Array.isArray(row.included_services) ? row.included_services : [],
  };
}

export function useProjects(opts: { onlyPublished?: boolean } = { onlyPublished: true }) {
  return useQuery({
    queryKey: ["projects", opts.onlyPublished ?? true],
    queryFn: async (): Promise<Project[]> => {
      let q = supabase.from("projects" as any).select("*").order("display_order", { ascending: true });
      if (opts.onlyPublished) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return ((data ?? []) as any[]).map(normalize);
    },
  });
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ["project", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects" as any)
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data ? normalize(data) : null;
    },
  });
}
