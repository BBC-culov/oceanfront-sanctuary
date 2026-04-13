import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (res.ok && data.valid) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.success) setStatus("success");
      else if (result.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-light text-foreground font-serif">Baz House</h1>

          {status === "loading" && (
            <p className="text-muted-foreground">Verifica in corso...</p>
          )}

          {status === "valid" && (
            <div className="space-y-4">
              <p className="text-foreground">Vuoi annullare l'iscrizione alle email di Baz House?</p>
              <button
                onClick={handleUnsubscribe}
                disabled={processing}
                className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {processing ? "Elaborazione..." : "Conferma disiscrizione"}
              </button>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-2">
              <p className="text-foreground font-medium">Disiscrizione completata ✓</p>
              <p className="text-muted-foreground text-sm">Non riceverai più email promozionali da Baz House.</p>
            </div>
          )}

          {status === "already" && (
            <div className="space-y-2">
              <p className="text-foreground">Sei già stato disiscritto.</p>
              <p className="text-muted-foreground text-sm">Non riceverai più email da Baz House.</p>
            </div>
          )}

          {status === "invalid" && (
            <p className="text-destructive">Link non valido o scaduto.</p>
          )}

          {status === "error" && (
            <p className="text-destructive">Si è verificato un errore. Riprova più tardi.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Unsubscribe;
