import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

/**
 * Single source of truth for the current user's roles.
 * Fetches all roles in ONE query (instead of multiple has_role RPCs)
 * and exposes derived booleans. Heavily cached to minimize backend calls.
 */
export function useUserRoles() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", userId],
    queryFn: async () => {
      if (!userId) return [] as string[];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.role as string);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const isAmministratore = roles.includes("amministratore");
  // 'amministratore' inherits admin privileges (matches has_role aliasing)
  const isAdmin = roles.includes("admin") || isAmministratore;
  const isProprietario = roles.includes("proprietario");

  const loading = userId === undefined || (!!userId && isLoading);

  return {
    userId: userId ?? null,
    roles,
    isAdmin: userId ? isAdmin : false,
    isAmministratore: userId ? isAmministratore : false,
    isProprietario: userId ? isProprietario : false,
    loading,
  };
}
