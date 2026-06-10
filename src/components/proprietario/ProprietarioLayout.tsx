import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ProprietarioSidebar } from "./ProprietarioSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UserCircle, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProprietarioLayout = () => {
  const { isProprietario, loading } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    if (!loading && !isProprietario) {
      navigate("/", { replace: true });
    }
  }, [loading, isProprietario, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-sans text-sm text-muted-foreground">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  if (!isProprietario) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <ProprietarioSidebar />
        <div className="flex-1 flex flex-col min-h-screen relative">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground">BAZHOUSE</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="font-sans text-sm font-medium text-foreground">Dashboard Proprietario</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-sans text-xs text-foreground truncate max-w-[200px]">{userEmail}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <Home className="w-3 h-3 text-primary" />
                  <span className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground">
                    Proprietario
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProprietarioLayout;
