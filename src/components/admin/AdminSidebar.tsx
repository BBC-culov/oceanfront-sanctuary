import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Building2, ArrowLeft, LogOut, Users, Settings, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAmministratoreCheck } from "@/hooks/useAmministratoreCheck";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo-bazhouse.png";

const menuItems = [
  { title: "Overview", to: "/admin", icon: LayoutDashboard },
  { title: "Prenotazioni", to: "/admin/prenotazioni", icon: CalendarDays },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isAmministratore } = useAmministratoreCheck();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Logo */}
        <motion.div
          className={`px-4 py-5 ${collapsed ? "flex justify-center" : ""}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/">
            <motion.img
              src={logo}
              alt="BAZHOUSE"
              className={`${collapsed ? "h-6" : "h-8"} w-auto transition-all`}
              whileHover={{ scale: 1.05 }}
            />
          </Link>
        </motion.div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Gestione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, i) => (
                <SidebarMenuItem key={item.to}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to)}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.to}
                        className={`relative flex items-center gap-3 font-sans text-sm transition-all ${
                          isActive(item.to)
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                          <item.icon className="w-4 h-4" />
                        </motion.div>
                        {!collapsed && <span>{item.title}</span>}
                        {isActive(item.to) && !collapsed && (
                          <motion.div
                            layoutId="admin-sidebar-active"
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Amministratore-only section */}
        {isAmministratore && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              Amministratore
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { title: "Appartamenti", to: "/admin/appartamenti", icon: Building2 },
                  { title: "Servizi Extra", to: "/admin/servizi", icon: Sparkles },
                  { title: "Gestione Admin", to: "/admin/gestione", icon: Users },
                  { title: "Gestione Sito", to: "/admin/sito", icon: Settings },
                ].map((item, idx) => (
                  <SidebarMenuItem key={item.to}>
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05, duration: 0.3 }}
                    >
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to)}
                        tooltip={item.title}
                      >
                        <Link
                          to={item.to}
                          className={`relative flex items-center gap-3 font-sans text-sm transition-all ${
                            isActive(item.to)
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                            <item.icon className="w-4 h-4" />
                          </motion.div>
                          {!collapsed && <span>{item.title}</span>}
                          {isActive(item.to) && !collapsed && (
                            <motion.div
                              layoutId="admin-sidebar-active"
                              className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full"
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Torna al sito">
              <Link
                to="/"
                className="flex items-center gap-3 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <motion.div whileHover={{ x: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                  <ArrowLeft className="w-4 h-4" />
                </motion.div>
                {!collapsed && <span>Torna al sito</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Esci"
              className="flex items-center gap-3 font-sans text-sm text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Esci</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
