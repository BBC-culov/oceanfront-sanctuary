import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import heroImg from "@/assets/boavista-sunset.jpg";

const passwordSchema = z.object({
  password: z.string().min(8, "La password deve avere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-ocean/60" />
        </div>

        <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-28">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="relative bg-background/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              <motion.div
                className="h-1.5 bg-gradient-to-r from-primary via-ocean to-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />

              <div className="px-8 py-12">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h2 className="font-serif text-2xl text-foreground mb-3">Password aggiornata!</h2>
                    <p className="text-muted-foreground text-sm font-sans mb-6">
                      La tua password è stata reimpostata con successo. Verrai reindirizzato alla home...
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="text-xs text-primary hover:text-primary/80 transition-colors font-sans"
                    >
                      Vai subito alla home →
                    </button>
                  </motion.div>
                ) : !isRecovery ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6"
                    >
                      <AlertCircle className="w-10 h-10 text-destructive" />
                    </motion.div>
                    <h2 className="font-serif text-2xl text-foreground mb-3">Link non valido</h2>
                    <p className="text-muted-foreground text-sm font-sans mb-6">
                      Questo link di reset password non è valido o è scaduto. Richiedi un nuovo link dalla pagina di login.
                    </p>
                    <button
                      onClick={() => navigate("/registrati")}
                      className="py-3 px-6 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase transition-all duration-300 hover:bg-primary/90"
                    >
                      Vai al Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.7, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                      >
                        <Lock className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h1 className="font-serif text-2xl text-foreground mb-1">Nuova password</h1>
                      <p className="text-muted-foreground text-sm font-sans">
                        Inserisci la tua nuova password
                      </p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4"
                        >
                          <div className="flex items-center gap-2 p-3 rounded-lg text-sm font-sans bg-destructive/10 text-destructive">
                            <AlertCircle size={16} />
                            {error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Nuova Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans">
                            <AlertCircle size={12} />{fieldErrors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Conferma Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <p className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans">
                            <AlertCircle size={12} />{fieldErrors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-sans">
                        Min. 8 caratteri, una maiuscola e un numero
                      </p>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Imposta password<ArrowRight size={16} /></>}
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ResetPassword;
