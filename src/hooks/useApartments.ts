import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import staticApartments from "@/data/apartments";

export interface ApartmentPublic {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover: string;
  gallery: string[];
  videos: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  services: string[];
  address: string;
  mapQuery: string;
  category: "residence" | "penthouse" | "compact";
  pricePerNight: number;
  checkInTime: string;
  checkOutTime: string;
  isFeatured: boolean;
  displayOrder: number;
}

function mapRow(row: any): ApartmentPublic {
  const dbImages: string[] = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
  
  // If no DB images, fall back to static apartment images
  let cover = dbImages[0] ?? "";
  let gallery = dbImages;
  
  if (dbImages.length === 0) {
    const staticMatch = staticApartments.find((s) => s.slug === row.slug);
    if (staticMatch) {
      cover = staticMatch.cover;
      gallery = staticMatch.gallery;
    }
  }

  const videos: string[] = Array.isArray(row.videos) ? row.videos.filter(Boolean) : [];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    cover,
    gallery,
    videos,
    guests: row.guests,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqm: row.sqm,
    services: Array.isArray(row.services) ? row.services : [],
    address: row.address ?? "",
    mapQuery: row.map_query ?? "",
    category: row.category as ApartmentPublic["category"],
    pricePerNight: row.price_per_night ?? 0,
    checkInTime: row.check_in_time ?? "15:00",
    checkOutTime: row.check_out_time ?? "10:00",
    isFeatured: !!row.is_featured,
    displayOrder: row.display_order ?? 999,
  };
}

export function useApartments() {
  return useQuery({
    queryKey: ["apartments-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apartments")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    staleTime: 15 * 60 * 1000, // 15 min
    gcTime: 60 * 60 * 1000,    // 1 ora
  });
}

export function useApartmentBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["apartment-public", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("apartments")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return mapRow(data);
    },
    enabled: !!slug,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
