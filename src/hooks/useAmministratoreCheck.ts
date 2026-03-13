import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAmministratoreCheck() {
  const [isAmministratore, setIsAmministratore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAmministratore(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "amministratore",
      });
      setIsAmministratore(!!data);
      setLoading(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => subscription.unsubscribe();
  }, []);

  return { isAmministratore, loading };
}
