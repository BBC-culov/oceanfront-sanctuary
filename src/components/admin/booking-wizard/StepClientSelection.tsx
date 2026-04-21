import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Users, Mail, Phone, Loader2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { isValidPhone } from "@/lib/bookingValidation";

export interface ClientSelection {
  mode: "existing" | "new";
  existing_user_id?: string;
  existing_user_email?: string;
  existing_user_first_name?: string;
  existing_user_last_name?: string;
  existing_user_phone?: string;
  new_email?: string;
  new_first_name?: string;
  new_last_name?: string;
  new_phone?: string;
}

interface FoundUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface Props {
  value: ClientSelection;
  onChange: (v: ClientSelection) => void;
}

const StepClientSelection = ({ value, onChange }: Props) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search
  useEffect(() => {
    if (value.mode !== "existing" || search.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("admin-search-users", {
          body: { query: search.trim() },
        });
        if (!error && data?.users) setResults(data.users);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, value.mode]);

  const selectUser = (u: FoundUser) => {
    onChange({
      mode: "existing",
      existing_user_id: u.id,
      existing_user_email: u.email,
      existing_user_first_name: u.first_name,
      existing_user_last_name: u.last_name,
      existing_user_phone: u.phone,
    });
  };

  const clearSelection = () => {
    onChange({ mode: "existing" });
    setSearch("");
    setResults([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h3 className="font-serif text-xl text-foreground mb-1">Cliente destinatario</h3>
        <p className="font-sans text-sm text-muted-foreground">
          Seleziona un cliente esistente o crea un nuovo account.
        </p>
      </div>

      <RadioGroup
        value={value.mode}
        onValueChange={(v) => onChange({ mode: v as "existing" | "new" })}
        className="grid grid-cols-2 gap-3"
      >
        <label
          htmlFor="mode-existing"
          className={`relative flex items-center gap-3 p-4 border cursor-pointer transition-all ${
            value.mode === "existing" ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
          }`}
        >
          <RadioGroupItem value="existing" id="mode-existing" />
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-sans text-sm text-foreground">Cliente esistente</span>
        </label>
        <label
          htmlFor="mode-new"
          className={`relative flex items-center gap-3 p-4 border cursor-pointer transition-all ${
            value.mode === "new" ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
          }`}
        >
          <RadioGroupItem value="new" id="mode-new" />
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          <span className="font-sans text-sm text-foreground">Nuovo cliente</span>
        </label>
      </RadioGroup>

      {value.mode === "existing" && (
        <div className="space-y-3">
          {value.existing_user_id ? (
            <div className="border border-primary/40 bg-primary/5 p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-primary" />
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {value.existing_user_first_name} {value.existing_user_last_name}
                  </p>
                </div>
                <p className="font-sans text-xs text-muted-foreground truncate">{value.existing_user_email}</p>
                {value.existing_user_phone && (
                  <p className="font-sans text-xs text-muted-foreground truncate">{value.existing_user_phone}</p>
                )}
              </div>
              <button
                onClick={clearSelection}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Rimuovi selezione"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per email, nome, cognome o telefono..."
                  className="pl-9 font-sans"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>

              {results.length > 0 && (
                <div className="border border-border max-h-64 overflow-y-auto divide-y divide-border">
                  {results.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => selectUser(u)}
                      className="w-full text-left p-3 hover:bg-muted/40 transition-colors"
                    >
                      <p className="font-sans text-sm text-foreground">
                        {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : "—"}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">{u.email}</p>
                    </button>
                  ))}
                </div>
              )}

              {hasSearched && !loading && results.length === 0 && search.trim().length >= 2 && (
                <p className="font-sans text-xs text-muted-foreground italic">
                  Nessun cliente trovato. Prova con un'altra ricerca o crea un nuovo account.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {value.mode === "new" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-sans text-xs">Nome *</Label>
              <Input
                value={value.new_first_name ?? ""}
                onChange={(e) => onChange({ ...value, new_first_name: e.target.value })}
                placeholder="Nome"
                className="font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-xs">Cognome *</Label>
              <Input
                value={value.new_last_name ?? ""}
                onChange={(e) => onChange({ ...value, new_last_name: e.target.value })}
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
                value={value.new_email ?? ""}
                onChange={(e) => onChange({ ...value, new_email: e.target.value })}
                placeholder="cliente@email.com"
                className="pl-9 font-sans"
              />
            </div>
            <p className="font-sans text-[11px] text-muted-foreground">
              Verrà creato un account associato a questa email. Il cliente potrà reimpostare la password con la funzione "Password dimenticata".
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-xs">Telefono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={value.new_phone ?? ""}
                onChange={(e) => onChange({ ...value, new_phone: e.target.value })}
                placeholder="+39 ..."
                className="pl-9 font-sans"
              />
            </div>
            {value.new_phone && !isValidPhone(value.new_phone) && (
              <p className="font-sans text-[11px] text-destructive">Formato telefono non valido</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StepClientSelection;
