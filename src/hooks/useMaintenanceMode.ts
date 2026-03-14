import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceData {
  enabled: boolean;
  message: string;
}

export function useMaintenanceMode() {
  const [maintenance, setMaintenance] = useState<MaintenanceData>({ enabled: false, message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();
      if (data?.value) {
        const val = data.value as unknown as MaintenanceData;
        setMaintenance(val);
      }
      setLoading(false);
    };
    fetch();

    // Realtime subscription
    const channel = supabase
      .channel("site_settings_maintenance")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings", filter: "key=eq.maintenance_mode" },
        (payload) => {
          const val = payload.new.value as unknown as MaintenanceData;
          setMaintenance(val);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { maintenance, loading };
}
