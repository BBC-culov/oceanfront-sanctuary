import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, CalendarDays, CalendarRange, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
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
  { title: "Panoramica", to: "/proprietario", icon: LayoutDashboard },
  { title: "I miei appartamenti", to: "/proprietario/appartamenti", icon: Building2 },
  { title: "Disponibilità", to: "/proprietario/disponibilita", icon: CalendarRange },
  { title: "Prenotazioni", to: "/proprietario/prenotazioni", icon: CalendarDays },
];

export function ProprietarioSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/proprietario") return location.pathname === "/proprietario";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <motion.div
          className={`px-4 py-5 ${collapsed ? "flex justify-center" : ""}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/">
            <img src={logo} alt="BAZHOUSE" className={`${collapsed ? "h-6" : "h-8"} w-auto transition-all`} />
          </Link>
        </motion.div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Proprietario
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
                    <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.title}>
                      <Link
                        to={item.to}
                        className={`relative flex items-center gap-3 font-sans text-sm transition-all ${
                          isActive(item.to)
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                        {isActive(item.to) && !collapsed && (
                          <motion.div
                            layoutId="proprietario-sidebar-active"
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
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Torna al sito">
              <Link to="/" className="flex items-center gap-3 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
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
