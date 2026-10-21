/* eslint-disable @typescript-eslint/no-unused-vars */
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

export default function AdminUserDeleteDialog({ state }: { state: AdminUsersState }) {
  const { users, loading, search, setSearch, dialogOpen, setDialogOpen, deleteDialogOpen, setDeleteDialogOpen, editingUser, deletingUser, submitting, formEmail, setFormEmail, formPassword, setFormPassword, formFirstName, setFormFirstName, formLastName, setFormLastName, formPhone, setFormPhone, formRole, setFormRole, resetForm, openCreate, openEdit, openDelete, handleSubmit, handleDelete, filteredUsers } = state;
  return (
    <>
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
    </>
  );
}
