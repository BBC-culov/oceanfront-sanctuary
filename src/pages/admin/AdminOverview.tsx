import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CalendarDays, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalBookings: number;
  totalApartments: number;
  totalClients: number;
}

interface RecentBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  status: string;
  apartment_name?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "In attesa",
  confirmed: "Confermata",
  cancelled: "Cancellata",
};

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, totalApartments: 0, totalClients: 0 });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [bookingsRes, apartmentsRes, usersRes, recentRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("apartments").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }),
        supabase.from("bookings").select("id, guest_name, guest_email, check_in, check_out, status, apartment_id").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalBookings: bookingsRes.count ?? 0,
        totalApartments: apartmentsRes.count ?? 0,
        totalClients: usersRes.count ?? 0,
      });

      if (recentRes.data) {
        const aptIds = [...new Set(recentRes.data.map((b: any) => b.apartment_id))];
        const { data: apts } = await supabase.from("apartments").select("id, name").in("id", aptIds);
        const aptMap = new Map((apts ?? []).map((a: any) => [a.id, a.name]));

        setRecentBookings(
          recentRes.data.map((b: any) => ({
            ...b,
            apartment_name: aptMap.get(b.apartment_id) ?? "—",
          }))
        );
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Prenotazioni", value: stats.totalBookings, icon: CalendarDays, color: "text-primary", link: "/admin/prenotazioni" },
    { label: "Appartamenti", value: stats.totalApartments, icon: Building2, color: "text-ocean", link: "/admin/appartamenti" },
    { label: "Utenti registrati", value: stats.totalClients, icon: Users, color: "text-accent-foreground", link: null },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-serif text-3xl font-light text-foreground">Dashboard</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Panoramica generale</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            onHoverStart={() => setHoveredStat(i)}
            onHoverEnd={() => setHoveredStat(null)}
            onClick={() => card.link && navigate(card.link)}
            className={card.link ? "cursor-pointer" : ""}
          >
            <Card className="bg-background overflow-hidden relative group h-full">
              {/* Animated background glow on hover */}
              <motion.div
                className="absolute inset-0 bg-primary/5 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredStat === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <CardContent className="pt-6 pb-6 relative h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    <motion.p
                      className="font-serif text-3xl font-light mt-1"
                      key={loading ? "loading" : card.value}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    >
                      {loading ? "—" : card.value}
                    </motion.p>
                  </div>
                  <motion.div
                    className={`p-3 rounded-lg bg-muted ${card.color}`}
                    animate={{
                      scale: hoveredStat === i ? 1.1 : 1,
                      rotate: hoveredStat === i ? 5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <card.icon className="w-5 h-5" />
                  </motion.div>
                </div>
                <div className="h-6 mt-3">
                  {card.link ? (
                    <motion.div
                      className="flex items-center gap-1 font-sans text-xs text-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredStat === i ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>Visualizza</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </motion.div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="w-5 h-5 text-primary" />
              </motion.div>
              Ultime prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-12 bg-muted/50 rounded-md"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CalendarDays className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nessuna prenotazione ancora.</p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-sans text-xs uppercase tracking-wider text-muted-foreground py-3 px-2">Cliente</th>
                      <th className="text-left font-sans text-xs uppercase tracking-wider text-muted-foreground py-3 px-2">Appartamento</th>
                      <th className="text-left font-sans text-xs uppercase tracking-wider text-muted-foreground py-3 px-2">Check-in</th>
                      <th className="text-left font-sans text-xs uppercase tracking-wider text-muted-foreground py-3 px-2">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b, i) => (
                      <motion.tr
                        key={b.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                      >
                        <td className="py-3 px-2">
                          <p className="font-sans text-sm text-foreground">{b.guest_name}</p>
                          <p className="font-sans text-xs text-muted-foreground">{b.guest_email}</p>
                        </td>
                        <td className="py-3 px-2 font-sans text-sm text-foreground">{b.apartment_name}</td>
                        <td className="py-3 px-2 font-sans text-sm text-muted-foreground">
                          {format(new Date(b.check_in), "dd MMM yyyy", { locale: it })}
                        </td>
                        <td className="py-3 px-2">
                          <motion.span
                            className={`inline-block font-sans text-xs px-2.5 py-1 rounded-full ${statusColors[b.status] ?? ""}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {statusLabels[b.status] ?? b.status}
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
