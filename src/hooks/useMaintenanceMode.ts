import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceData {
  enabled: boolean;
  message: string;
}

export function useMaintenanceMode() {
  const { data, isLoading } = useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();
      if (data?.value) {
        return data.value as unknown as MaintenanceData;
      }
      return { enabled: false, message: "" };
    },
    staleTime: 10 * 60 * 1000,  // 10 min — raramente cambia
    gcTime: 60 * 60 * 1000,     // 1 ora in cache
  });

  return {
    maintenance: data ?? { enabled: false, message: "" },
    loading: isLoading,
  };
}
