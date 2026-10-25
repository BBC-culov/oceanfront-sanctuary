import { errorMessage } from "@/lib/dataTypes";
// Data + actions for the admin "Proprietari" page: owners, apartment assignment, booking stats.
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OwnerUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  roles: string[];
  created_at: string;
}

export interface Apartment {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  is_active: boolean;
}

export interface BookingRow {
  id: string;
  apartment_id: string;
  total_price: number | null;
  amount_paid: number | null;
  status: string;
  check_in: string;
  check_out: string;
}

export function useAdminOwners(isAmministratore: boolean) {
  const [owners, setOwners] = useState<OwnerUser[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "incomplete">("all");
  const [aptCountFilter, setAptCountFilter] = useState<"all" | "0" | "1" | "2+">("all");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerUser | null>(null);
  const [selectedApts, setSelectedApts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: usersData, error: usersErr }, aptRes, bkRes] = await Promise.all([
        supabase.functions.invoke("manage-admin", { body: { action: "list" } }),
        supabase.from("apartments").select("id, name, slug, owner_id, is_active").order("name"),
        supabase.from("bookings").select("id, apartment_id, total_price, amount_paid, status, check_in, check_out"),
      ]);
      if (usersErr) throw usersErr;
      if (aptRes.error) throw aptRes.error;
      if (bkRes.error) throw bkRes.error;

      const onlyOwners = (usersData?.users || []).filter((u: OwnerUser) => u.roles.includes("proprietario"));
      setOwners(onlyOwners);
      setApartments((aptRes.data || []) as Apartment[]);
      setBookings((bkRes.data || []) as BookingRow[]);
    } catch (e: unknown) {
      toast.error("Errore", { description: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAmministratore) fetchAll();
  }, [isAmministratore, fetchAll]);

  const statsByOwner = useMemo(() => {
    const map: Record<string, {
      apts: Apartment[];
      bookings: BookingRow[];
      revenue: number;
      received: number;
      confirmed: number;
    }> = {};
    for (const o of owners) {
      const apts = apartments.filter(a => a.owner_id === o.id);
      const aptIds = new Set(apts.map(a => a.id));
      const obks = bookings.filter(b => aptIds.has(b.apartment_id));
      const confirmed = obks.filter(b => b.status === "confirmed");
      map[o.id] = {
        apts,
        bookings: obks,
        revenue: confirmed.reduce((s, b) => s + Number(b.total_price || 0), 0),
        received: confirmed.reduce((s, b) => s + Number(b.amount_paid || 0), 0),
        confirmed: confirmed.length,
      };
    }
    return map;
  }, [owners, apartments, bookings]);

  const unassignedCount = apartments.filter(a => !a.owner_id).length;

  const openAssign = (owner: OwnerUser) => {
    setSelectedOwner(owner);
    setSelectedApts(new Set(apartments.filter(a => a.owner_id === owner.id).map(a => a.id)));
    setAssignOpen(true);
  };

  const toggleApt = (id: string) => {
    setSelectedApts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveAssignments = async () => {
    if (!selectedOwner) return;
    setSaving(true);
    try {
      const current = new Set(apartments.filter(a => a.owner_id === selectedOwner.id).map(a => a.id));
      const toAdd = [...selectedApts].filter(id => !current.has(id));
      const toRemove = [...current].filter(id => !selectedApts.has(id));

      if (toAdd.length) {
        const { error } = await supabase
          .from("apartments")
          .update({ owner_id: selectedOwner.id })
          .in("id", toAdd);
        if (error) throw error;
      }
      if (toRemove.length) {
        const { error } = await supabase
          .from("apartments")
          .update({ owner_id: null })
          .in("id", toRemove);
        if (error) throw error;
      }

      toast("Assegnazioni aggiornate", { description: `${selectedApts.size} appartamento/i assegnati a ${selectedOwner.email}.` });
      setAssignOpen(false);
      fetchAll();
    } catch (e: unknown) {
      toast.error("Errore", { description: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const filtered = owners.filter(o => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      o.email.toLowerCase().includes(q) ||
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(q);

    const count = statsByOwner[o.id]?.apts.length ?? 0;
    const isActive = count > 0;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "incomplete" && !isActive);

    const matchesAptCount =
      aptCountFilter === "all" ||
      (aptCountFilter === "0" && count === 0) ||
      (aptCountFilter === "1" && count === 1) ||
      (aptCountFilter === "2+" && count >= 2);

    return matchesSearch && matchesStatus && matchesAptCount;
  });

  return { owners, apartments, bookings, loading, search, setSearch, statusFilter, setStatusFilter, aptCountFilter, setAptCountFilter, assignOpen, setAssignOpen, selectedOwner, selectedApts, saving, fetchAll, statsByOwner, unassignedCount, openAssign, toggleApt, saveAssignments, filtered };
}
