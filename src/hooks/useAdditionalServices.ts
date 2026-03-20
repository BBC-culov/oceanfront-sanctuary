import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdditionalService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sort_order: number;
}

export const useAdditionalServices = () => {
  return useQuery({
    queryKey: ["additional-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("additional_services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as AdditionalService[];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};
