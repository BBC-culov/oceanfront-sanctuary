import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CalendarDays, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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

  useEffect(() => {
    const fetchData = async () => {
      const [bookingsRes, apartmentsRes, profilesRes, recentRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("apartments").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id, guest_name, guest_email, check_in, check_out, status, apartment_id").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalBookings: bookingsRes.count ?? 0,
        totalApartments: apartmentsRes.count ?? 0,
        totalClients: profilesRes.count ?? 0,
      });

      if (recentRes.data) {
        // Fetch apartment names for recent bookings
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
    { label: "Prenotazioni", value: stats.totalBookings, icon: CalendarDays, color: "text-primary" },
    { label: "Appartamenti", value: stats.totalApartments, icon: Building2, color: "text-ocean" },
    { label: "Clienti registrati", value: stats.totalClients, icon: Users, color: "text-accent-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-light text-foreground">Dashboard</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Panoramica generale</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    <p className="font-serif text-3xl font-light mt-1">
                      {loading ? "—" : card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
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
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Ultime prenotazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            ) : recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuna prenotazione ancora.</p>
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
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-2">
                          <p className="font-sans text-sm text-foreground">{b.guest_name}</p>
                          <p className="font-sans text-xs text-muted-foreground">{b.guest_email}</p>
                        </td>
                        <td className="py-3 px-2 font-sans text-sm text-foreground">{b.apartment_name}</td>
                        <td className="py-3 px-2 font-sans text-sm text-muted-foreground">
                          {format(new Date(b.check_in), "dd MMM yyyy", { locale: it })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-block font-sans text-xs px-2.5 py-1 rounded-full ${statusColors[b.status] ?? ""}`}>
                            {statusLabels[b.status] ?? b.status}
                          </span>
                        </td>
                      </tr>
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
