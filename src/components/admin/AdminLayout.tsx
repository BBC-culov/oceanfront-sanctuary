import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UserCircle, Shield, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLayout = () => {
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUserEmail(session.user.email ?? "");
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      if (data && data.length > 0) {
        // Pick highest role
        const roles = data.map(r => r.role);
        if (roles.includes("amministratore")) setUserRole("Amministratore");
        else if (roles.includes("admin")) setUserRole("Admin");
        else setUserRole("Utente");
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="font-sans text-sm text-muted-foreground">Verifica accesso...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen relative">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-14 flex items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-40"
          >
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex items-center gap-2">
              <motion.span
                className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                BAZHOUSE
              </motion.span>
              <span className="text-muted-foreground/40">|</span>
              <motion.span
                className="font-sans text-sm font-medium text-foreground"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Admin Dashboard
              </motion.span>
            </div>
          </motion.header>
          <main className="flex-1 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <a
              href="https://studionavi.it"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-sans text-[10px] tracking-wider text-muted-foreground/50 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md"
            >
              Powered by <span className="font-medium text-foreground/60">StudioNavi.it</span>
            </a>
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
