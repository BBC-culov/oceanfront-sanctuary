// State and server calls for the admin accounts page (manage-admin function).
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  roles: string[];
  created_at: string;
}

export function useAdminUsers(isAmministratore: boolean) {
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

  // Poll for user/role changes every 30s (realtime removed for security)
  useEffect(() => {
    if (!isAmministratore) return;
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
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
    setFormRole(
      user.roles.includes("amministratore")
        ? "amministratore"
        : user.roles.includes("proprietario")
        ? "proprietario"
        : "admin"
    );
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

  return { users, loading, search, setSearch, dialogOpen, setDialogOpen, deleteDialogOpen, setDeleteDialogOpen, editingUser, deletingUser, submitting, formEmail, setFormEmail, formPassword, setFormPassword, formFirstName, setFormFirstName, formLastName, setFormLastName, formPhone, setFormPhone, formRole, setFormRole, resetForm, openCreate, openEdit, openDelete, handleSubmit, handleDelete, filteredUsers };
}

export type AdminUsersState = ReturnType<typeof useAdminUsers>;
