import type { Tables, TablesInsert } from "@/integrations/supabase/types";

/** JSON columns contain string arrays written by the admin forms. */
export function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value as string[] : [];
}

export type ProjectData = Omit<Tables<"projects">, "images" | "included_services"> & {
  images: string[];
  included_services: string[];
};
export type ProjectPayload = TablesInsert<"projects">;
export type ApartmentPayload = TablesInsert<"apartments">;

export function normalizeProject(row: Tables<"projects">): ProjectData {
  return { ...row, images: stringArray(row.images), included_services: stringArray(row.included_services) };
}

/** Preserve messages from SDK errors and plain objects without assuming Error. */
export function errorMessage(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
}