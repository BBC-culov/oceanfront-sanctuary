import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { roleHomePath } from "@/lib/siteMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const GestioneLogin = () => {
  const { userId, roles, loading } = useUserRoles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  useEffect(() => {
    document.title = "BAZHOUSE Gestione";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const target = roleHomePath(roles);
  if (userId && target) return <Navigate to={target} replace />;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error("Email o password non corretti.");
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error("Invio non riuscito. Riprova tra qualche minuto.");
    else toast.success("Se l'indirizzo è registrato, riceverai un'email per reimpostare la password.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm bg-background border border-border rounded-lg p-8 shadow-sm">
        <h1 className="font-serif text-3xl text-foreground text-center">BAZHOUSE</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground text-center mt-1 mb-8">
          Gestione
        </p>

        {userId && !target ? (
          <div className="space-y-4 text-center">
            <p className="font-sans text-sm text-foreground">Accesso non autorizzato.</p>
            <p className="font-sans text-xs text-muted-foreground">
              Questo account non ha i permessi per la dashboard di gestione.
            </p>
            <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut()}>
              Esci
            </Button>
          </div>
        ) : mode === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">Email</label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accedi"}
            </Button>
            <button type="button" onClick={() => setMode("forgot")} className="w-full text-xs font-sans text-muted-foreground hover:text-foreground">
              Password dimenticata?
            </button>
          </form>
        ) : (
          <form onSubmit={onForgot} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">Email</label>
              <Input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invia link di reset"}
            </Button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-xs font-sans text-muted-foreground hover:text-foreground">
              Torna all'accesso
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GestioneLogin;
