import { motion, AnimatePresence } from "framer-motion";
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
import type { AdminUsersState } from "@/hooks/useAdminUsers";

export default function AdminUserFormDialog({ state }: { state: AdminUsersState }) {
  const { users, loading, search, setSearch, dialogOpen, setDialogOpen, deleteDialogOpen, setDeleteDialogOpen, editingUser, deletingUser, submitting, formEmail, setFormEmail, formPassword, setFormPassword, formFirstName, setFormFirstName, formLastName, setFormLastName, formPhone, setFormPhone, formRole, setFormRole, resetForm, openCreate, openEdit, openDelete, handleSubmit, handleDelete, filteredUsers } = state;
  return (
    <>
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
                  Nuovo Utente
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
                  <SelectItem value="proprietario" className="font-sans">
                    <div className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-primary" />
                      Proprietario
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
    </>
  );
}
