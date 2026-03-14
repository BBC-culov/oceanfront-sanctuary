import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Server, Shield, AlertTriangle, CheckCircle2, Wrench, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MaintenanceData {
  enabled: boolean;
  message: string;
}

const AdminGestioneSito = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceData>({ enabled: false, message: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();
      if (data?.value) {
        setMaintenance(data.value as unknown as MaintenanceData);
      }
      setLoading(false);
    };
    fetchSettings();

    const channel = supabase
      .channel("admin_site_settings")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_settings" }, (payload) => {
        if (payload.new.key === "maintenance_mode") {
          setMaintenance(payload.new.value as unknown as MaintenanceData);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleToggle = (checked: boolean) => {
    setPendingToggle(checked);
    setShowConfirm(true);
  };

  const confirmToggle = async () => {
    setShowConfirm(false);
    setSaving(true);
    const newData = { ...maintenance, enabled: pendingToggle };
    const { error } = await supabase
      .from("site_settings")
      .update({ value: newData as any, updated_at: new Date().toISOString() })
      .eq("key", "maintenance_mode");
    if (error) {
      toast({ title: "Errore", description: "Impossibile aggiornare le impostazioni.", variant: "destructive" });
    } else {
      setMaintenance(newData);
      toast({
        title: pendingToggle ? "Manutenzione attivata" : "Manutenzione disattivata",
        description: pendingToggle ? "Il sito è ora in modalità manutenzione." : "Il sito è di nuovo online.",
      });
    }
    setSaving(false);
  };

  const saveMessage = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: maintenance as any, updated_at: new Date().toISOString() })
      .eq("key", "maintenance_mode");
    if (error) {
      toast({ title: "Errore", description: "Impossibile salvare il messaggio.", variant: "destructive" });
    } else {
      toast({ title: "Salvato", description: "Messaggio di manutenzione aggiornato." });
    }
    setSaving(false);
  };

  const siteInfo = [
    { label: "Dominio", value: window.location.hostname, icon: Globe },
    { label: "Protocollo", value: window.location.protocol === "https:" ? "HTTPS (Sicuro)" : "HTTP", icon: Shield },
    { label: "Piattaforma", value: "Lovable Cloud", icon: Server },
    { label: "Stato", value: maintenance.enabled ? "Manutenzione" : "Online", icon: maintenance.enabled ? AlertTriangle : CheckCircle2 },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-32 bg-muted/50 rounded-lg"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="font-serif text-3xl font-light text-foreground">Gestione Sito</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Informazioni e configurazione del sito</p>
      </motion.div>

      {/* Site Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {siteInfo.map((info, i) => (
          <motion.div
            key={info.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="bg-background h-full">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <motion.div
                    className={`p-2.5 rounded-lg ${info.label === "Stato" && maintenance.enabled ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <info.icon className="w-4 h-4" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">{info.label}</p>
                    <p className={`font-sans text-sm font-medium mt-0.5 truncate ${info.label === "Stato" && maintenance.enabled ? "text-destructive" : "text-foreground"}`}>
                      {info.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Maintenance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-background overflow-hidden">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-light flex items-center gap-2">
              <motion.div
                animate={maintenance.enabled ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wrench className={`w-5 h-5 ${maintenance.enabled ? "text-destructive" : "text-primary"}`} />
              </motion.div>
              Modalità Manutenzione
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={maintenance.enabled ? "on" : "off"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {maintenance.enabled ? (
                      <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </motion.div>
                </AnimatePresence>
                <div>
                  <Label className="font-sans text-sm font-medium text-foreground">
                    {maintenance.enabled ? "Manutenzione attiva" : "Sito online"}
                  </Label>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    {maintenance.enabled
                      ? "I visitatori vedranno la pagina di manutenzione"
                      : "Il sito è accessibile normalmente"}
                  </p>
                </div>
              </div>
              <Switch
                checked={maintenance.enabled}
                onCheckedChange={handleToggle}
                disabled={saving}
              />
            </div>

            {/* Warning banner when active */}
            <AnimatePresence>
              {maintenance.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <div>
                      <p className="font-sans text-sm font-medium text-destructive">Attenzione</p>
                      <p className="font-sans text-xs text-destructive/80 mt-0.5">
                        Il sito è attualmente in manutenzione. Solo la dashboard admin è accessibile.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom message */}
            <div className="space-y-2">
              <Label className="font-sans text-sm text-foreground">Messaggio personalizzato</Label>
              <Textarea
                value={maintenance.message}
                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                placeholder="Messaggio visualizzato durante la manutenzione..."
                className="font-sans text-sm min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="font-sans text-xs text-muted-foreground">
                  {maintenance.message.length} caratteri
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveMessage}
                  disabled={saving}
                  className="font-sans text-xs"
                >
                  Salva messaggio
                </Button>
              </div>
            </div>

            {/* Preview link */}
            <motion.div
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/50"
              whileHover={{ backgroundColor: "hsl(var(--muted) / 0.4)" }}
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <p className="font-sans text-xs text-muted-foreground">
                La pagina di manutenzione viene mostrata a tutti i visitatori tranne gli amministratori nella dashboard.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl font-light">
              {pendingToggle ? "Attivare la manutenzione?" : "Disattivare la manutenzione?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-sm">
              {pendingToggle
                ? "Tutti i visitatori vedranno una pagina di manutenzione. La dashboard admin rimarrà accessibile."
                : "Il sito tornerà accessibile a tutti i visitatori."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-sm">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
              className={`font-sans text-sm ${pendingToggle ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}
            >
              {pendingToggle ? "Attiva manutenzione" : "Riattiva il sito"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGestioneSito;
