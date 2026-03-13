import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useAmministratoreCheck } from "@/hooks/useAmministratoreCheck";
import {
  Users, Plus, Pencil, Trash2, Shield, ShieldCheck,
  Loader2, Search, UserPlus, Mail, Phone, User, X, Check, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  roles: string[];
  created_at: string;
}

const AdminGestione = () => {
  const { isAmministratore, loading: roleLoading } = useAmministratoreCheck();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<string>("admin");

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "list" },
      });
      if (error) throw error;
      setUsers(data.users || []);
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAmministratore) fetchUsers();
  }, [isAmministratore, fetchUsers]);

  // Realtime subscription on user_roles
  useEffect(() => {
    if (!isAmministratore) return;
    const channel = supabase
      .channel("admin-roles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => {
        fetchUsers();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchUsers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAmministratore, fetchUsers]);

  const resetForm = () => {
    setFormEmail("");
    setFormPassword("");
    setFormFirstName("");
    setFormLastName("");
    setFormPhone("");
    setFormRole("admin");
    setEditingUser(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormPassword("");
    setFormFirstName(user.first_name);
    setFormLastName(user.last_name);
    setFormPhone(user.phone);
    setFormRole(user.roles.includes("amministratore") ? "amministratore" : "admin");
    setDialogOpen(true);
  };

  const openDelete = (user: AdminUser) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingUser) {
        const { error } = await supabase.functions.invoke("manage-admin", {
          body: {
            action: "update",
            user_id: editingUser.id,
            email: formEmail,
            first_name: formFirstName,
            last_name: formLastName,
            phone: formPhone,
            role: formRole,
          },
        });
        if (error) throw error;
        toast({ title: "Aggiornato", description: `${formEmail} aggiornato con successo.` });
      } else {
        if (!formPassword || formPassword.length < 8) {
          toast({ title: "Errore", description: "La password deve avere almeno 8 caratteri.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const { data, error } = await supabase.functions.invoke("manage-admin", {
          body: {
            action: "create",
            email: formEmail,
            password: formPassword,
            first_name: formFirstName,
            last_name: formLastName,
            phone: formPhone,
            role: formRole,
          },
        });
        if (error) throw error;
        if (data?.error) {
          toast({ title: "Errore", description: data.error, variant: "destructive" });
          setSubmitting(false);
          return;
        }
        toast({ title: "Creato", description: `Account ${formEmail} creato con successo.` });
      }
      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admin", {
        body: { action: "delete", user_id: deletingUser.id },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Errore", description: data.error, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      toast({ title: "Eliminato", description: `${deletingUser.email} è stato eliminato.` });
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAmministratore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 gap-4 text-center"
      >
        <Shield className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="font-sans text-xl font-semibold text-foreground">Accesso Riservato</h2>
        <p className="font-sans text-sm text-muted-foreground max-w-md">
          Questa sezione è accessibile solo agli account con ruolo Amministratore.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground flex items-center gap-2">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
              <Users className="w-6 h-6 text-primary" />
            </motion.div>
            Gestione Admin
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Gestisci gli account con privilegi amministrativi
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Nuovo Admin
          </Button>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per email o nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 font-sans"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="border border-border rounded-lg bg-background overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-muted-foreground/30" />
            <p className="font-sans text-sm text-muted-foreground">
              {search ? "Nessun risultato trovato" : "Nessun account admin presente"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans text-xs tracking-wider uppercase">Utente</TableHead>
                <TableHead className="font-sans text-xs tracking-wider uppercase">Contatto</TableHead>
                <TableHead className="font-sans text-xs tracking-wider uppercase">Ruolo</TableHead>
                <TableHead className="font-sans text-xs tracking-wider uppercase">Creato il</TableHead>
                <TableHead className="font-sans text-xs tracking-wider uppercase text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    className="border-b transition-colors hover:bg-muted/50 group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                          {user.roles.includes("amministratore") ? (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </motion.div>
                        <div>
                          <p className="font-sans text-sm font-medium text-foreground">
                            {user.first_name || user.last_name
                              ? `${user.first_name} ${user.last_name}`.trim()
                              : "—"}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="font-sans">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span className="font-sans">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "amministratore" ? "default" : "secondary"}
                          className="font-sans text-[10px] uppercase tracking-wider mr-1"
                        >
                          {role === "amministratore" ? "Amministratore" : "Admin"}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <span className="font-sans text-xs text-muted-foreground">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDelete(user)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4 text-xs font-sans text-muted-foreground"
      >
        <span>Totale: {users.length} account</span>
        <span>•</span>
        <span>{users.filter(u => u.roles.includes("amministratore")).length} amministratori</span>
        <span>•</span>
        <span>{users.filter(u => u.roles.includes("admin") && !u.roles.includes("amministratore")).length} admin</span>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans flex items-center gap-2">
              {editingUser ? (
                <>
                  <Pencil className="w-4 h-4 text-primary" />
                  Modifica Admin
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-primary" />
                  Nuovo Admin
                </>
              )}
            </DialogTitle>
            <DialogDescription className="font-sans text-sm">
              {editingUser
                ? "Modifica le informazioni dell'account amministrativo."
                : "Crea un nuovo account con privilegi amministrativi."}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-sans text-xs">Nome</Label>
                <Input
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder="Nome"
                  className="font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-xs">Cognome</Label>
                <Input
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder="Cognome"
                  className="font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-sans text-xs">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  className="pl-9 font-sans"
                />
              </div>
            </div>

            {!editingUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1.5"
              >
                <Label className="font-sans text-xs">Password *</Label>
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimo 8 caratteri"
                  className="font-sans"
                />
              </motion.div>
            )}

            <div className="space-y-1.5">
              <Label className="font-sans text-xs">Telefono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+39 ..."
                  className="pl-9 font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-sans text-xs">Ruolo *</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="font-sans">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="amministratore" className="font-sans">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      Amministratore
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); resetForm(); }}
              className="font-sans"
            >
              Annulla
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleSubmit} disabled={submitting || !formEmail} className="font-sans gap-2">
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingUser ? "Salva modifiche" : "Crea account"}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Conferma eliminazione
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              Stai per eliminare definitivamente l'account{" "}
              <strong className="text-foreground">{deletingUser?.email}</strong>.
              <br />
              Questa azione è irreversibile e tutti i dati associati verranno persi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Annulla</AlertDialogCancel>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Elimina definitivamente
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGestione;
