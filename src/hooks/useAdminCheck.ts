import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data: isAdminRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      const { data: isAmministratore } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "amministratore",
      });
      setIsAdmin(!!isAdminRole || !!isAmministratore);
      setLoading(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
}
