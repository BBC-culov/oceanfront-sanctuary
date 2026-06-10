import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";

export interface OwnerApartment {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_per_night: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  address: string | null;
  images: string[];
  is_active: boolean;
}

export interface OwnerBooking {
  id: string;
  booking_code: string | null;
  apartment_id: string;
  guest_name: string | null;
  guest_last_name: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number | null;
  amount_paid: number | null;
  deposit_amount: number | null;
  created_at: string;
}

export function useOwnerApartments() {
  const { userId, isProprietario } = useUserRoles();
  return useQuery({
    queryKey: ["owner-apartments", userId],
    enabled: !!userId && isProprietario,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apartments")
        .select("id, slug, name, category, price_per_night, guests, bedrooms, bathrooms, sqm, address, images, is_active")
        .eq("owner_id", userId!)
        .order("name");
      if (error) throw error;
      return (data ?? []).map((a: any) => ({
        ...a,
        images: Array.isArray(a.images) ? a.images : [],
      })) as OwnerApartment[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnerBookings() {
  const { userId, isProprietario } = useUserRoles();
  return useQuery({
    queryKey: ["owner-bookings", userId],
    enabled: !!userId && isProprietario,
    queryFn: async () => {
      // Bookings are returned via the proprietario RLS policy (only own apartments)
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_code, apartment_id, guest_name, guest_last_name, guest_email, check_in, check_out, status, total_price, amount_paid, deposit_amount, created_at")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OwnerBooking[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useOwnerGuestCounts(bookingIds: string[]) {
  return useQuery({
    queryKey: ["owner-guest-counts", bookingIds.slice().sort().join(",")],
    enabled: bookingIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_guests")
        .select("booking_id")
        .in("booking_id", bookingIds);
      if (error) throw error;
      const counts = new Map<string, number>();
      (data ?? []).forEach((g: any) => {
        counts.set(g.booking_id, (counts.get(g.booking_id) ?? 0) + 1);
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });
}
