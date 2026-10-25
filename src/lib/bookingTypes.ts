import type { Tables } from "@/integrations/supabase/types";

export type SelectedService = {
  id: string;
  name: string;
  price: number;
};

export type BookingData = Omit<Tables<"bookings">, "selected_services"> & {
  selected_services: SelectedService[] | null;
};
export type BookingApartment = Omit<Pick<Tables<"apartments">, "name" | "slug" | "images" | "address">, "images"> & {
  images: string[] | null;
};
export type ServiceReference = string | { id?: string } | null;

/** Column shape is narrowed only at the read boundary; values are not rewritten. */
export function bookingData(row: Tables<"bookings">): BookingData {
  return row as BookingData;
}