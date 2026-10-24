// Admin project form: upload limits, validation schema, defaults and slug helper.
import { z } from "zod";
import type { ProjectRow } from "@/hooks/useAdminProjects";

export const MAX_IMAGE_MB = 8;
export const MAX_VIDEO_MB = 100;
export const MAX_BROCHURE_MB = 25;
export const MAX_IMAGES = 30;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ALLOWED_BROCHURE_TYPES = ["application/pdf"];

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Titolo: almeno 2 caratteri").max(150, "Titolo troppo lungo"),
  slug: z.string().trim().min(2, "Slug richiesto").max(150).regex(/^[a-z0-9-]+$/, "Slug: solo minuscole, numeri e trattini"),
  subtitle: z.string().trim().max(200, "Sottotitolo: max 200 caratteri").optional().nullable(),
  description: z.string().trim().max(5000, "Descrizione: max 5000 caratteri").optional().nullable(),
  price: z.number().int().min(0, "Prezzo non valido").max(100_000_000, "Prezzo troppo alto").nullable(),
  price_label: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  google_maps_url: z.string().trim().url("URL Google Maps non valido").max(500).optional().or(z.literal("")).nullable(),
  apple_maps_url: z.string().trim().url("URL Apple Maps non valido").max(500).optional().or(z.literal("")).nullable(),
  contact_email: z.string().trim().email("Email referente non valida").max(255).optional().or(z.literal("")).nullable(),
  contact_phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "Telefono non valido").optional().or(z.literal("")).nullable(),
  purchase_info: z.string().trim().max(3000).optional().nullable(),
});


export const empty: Partial<ProjectRow> = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  price: null,
  price_label: "A partire da",
  images: [],
  video_url: "",
  brochure_url: "",
  address: "",
  latitude: null,
  longitude: null,
  google_maps_url: "",
  apple_maps_url: "",
  included_services: [],
  purchase_info: "",
  contact_email: "",
  contact_phone: "",
  published: false,
  display_order: 0,
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

