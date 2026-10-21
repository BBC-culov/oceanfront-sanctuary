import { motion, AnimatePresence } from "framer-motion";
import { useAmministratoreCheck } from "@/hooks/useAmministratoreCheck";
import {
  Users, Plus, Pencil, Trash2, Shield, ShieldCheck, Home,
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
import { useAdminUsers } from "@/hooks/useAdminUsers";
import AdminUserFormDialog from "@/components/admin/gestione/AdminUserFormDialog";
import AdminUserDeleteDialog from "@/components/admin/gestione/AdminUserDeleteDialog";

const AdminGestione = () => {
  const { isAmministratore, loading: roleLoading } = useAmministratoreCheck();
  const adminUsers = useAdminUsers(isAmministratore);
  const { users, loading, search, setSearch, dialogOpen, setDialogOpen, deleteDialogOpen, setDeleteDialogOpen, editingUser, deletingUser, submitting, formEmail, setFormEmail, formPassword, setFormPassword, formFirstName, setFormFirstName, formLastName, setFormLastName, formPhone, setFormPhone, formRole, setFormRole, resetForm, openCreate, openEdit, openDelete, handleSubmit, handleDelete, filteredUsers } = adminUsers;


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
            Nuovo Utente
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
                          ) : user.roles.includes("proprietario") ? (
                            <Home className="w-4 h-4 text-primary" />
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
                          variant={role === "amministratore" ? "default" : role === "proprietario" ? "outline" : "secondary"}
                          className="font-sans text-[10px] uppercase tracking-wider mr-1"
                        >
                          {role === "amministratore" ? "Amministratore" : role === "proprietario" ? "Proprietario" : "Admin"}
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
        <span>•</span>
        <span>{users.filter(u => u.roles.includes("proprietario")).length} proprietari</span>
      </motion.div>

      <AdminUserFormDialog state={adminUsers} />

      {/* Delete Confirmation */}
      <AdminUserDeleteDialog state={adminUsers} />
    </div>
  );
};

export default AdminGestione;
