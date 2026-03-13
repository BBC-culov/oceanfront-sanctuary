import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Building2, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  { title: "Appartamenti", to: "/admin/appartamenti", icon: Building2 },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
        <div className={`px-4 py-5 ${collapsed ? "flex justify-center" : ""}`}>
          <Link to="/">
            <img
              src={logo}
              alt="BAZHOUSE"
              className={`${collapsed ? "h-6" : "h-8"} w-auto transition-all`}
            />
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Gestione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.title}
                  >
                    <Link
                      to={item.to}
                      className={`flex items-center gap-3 font-sans text-sm transition-colors ${
                        isActive(item.to)
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
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
              <Link
                to="/"
                className="flex items-center gap-3 font-sans text-sm text-muted-foreground hover:text-foreground"
              >
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
