import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useAmministratoreCheck() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: isAmministratore = false, isLoading: loading } = useQuery({
    queryKey: ["amministratore-check", userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "amministratore" });
      return !!data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { isAmministratore: userId ? isAmministratore : false, loading: userId === null ? true : loading };
}
