import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ATTENTION_STATUSES } from "@/lib/bookingStatus";

interface NotificationCounts {
  /** Total bookings that need admin attention */
  total: number;
  byStatus: Record<string, number>;
  loading: boolean;
}

/**
 * Counts bookings that require admin attention (pending, incomplete,
 * awaiting_verification). Subscribes to realtime updates so the badge
 * stays in sync without polling.
 */
export const useAdminNotifications = (): NotificationCounts => {
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    byStatus: {},
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("status")
        .in("status", ATTENTION_STATUSES as any);

      if (!mounted) return;
      if (error) {
        setCounts({ total: 0, byStatus: {}, loading: false });
        return;
      }

      const byStatus: Record<string, number> = {};
      for (const row of data ?? []) {
        const s = (row as any).status as string;
        byStatus[s] = (byStatus[s] ?? 0) + 1;
      }
      const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
      setCounts({ total, byStatus, loading: false });
    };

    fetchCounts();

    // Realtime subscription on bookings: refresh counts on any change
    const channel = supabase
      .channel("admin-bookings-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return counts;
};
