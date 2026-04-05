import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  Waves, Sun, Palmtree, Shell, Compass, Sparkles,
  Phone, MapPin, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PhonePrefixInput from "@/components/PhonePrefixInput";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import heroImg from "@/assets/boavista-sunset.jpg";

const floatingIcons = [
  { Icon: Waves, x: "10%", y: "20%", delay: 0, size: 28 },
  { Icon: Sun, x: "85%", y: "15%", delay: 0.5, size: 24 },
  { Icon: Palmtree, x: "90%", y: "60%", delay: 1, size: 30 },
  { Icon: Shell, x: "8%", y: "70%", delay: 1.5, size: 22 },
  { Icon: Compass, x: "50%", y: "85%", delay: 2, size: 26 },
  { Icon: Sparkles, x: "75%", y: "40%", delay: 0.8, size: 20 },
];

const inputVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 * i, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const tabContentVariants = {
  enter: { opacity: 0, y: 20, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
};

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci la password"),
});

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri").max(50, "Il nome è troppo lungo"),
  lastName: z.string().trim().min(2, "Il cognome deve avere almeno 2 caratteri").max(50, "Il cognome è troppo lungo"),
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  phone: z.string().trim().regex(/^\+?[0-9\s]{7,15}$/, "Inserisci un numero di telefono valido (es. +39 333 1234567)"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  confirmPassword: z.string(),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "Devi accettare la Privacy Policy, il Rental Agreement e la Refund Policy" }) }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

const errorVariants = {
  hidden: { opacity: 0, height: 0, y: -5 },
  visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, height: 0, y: -5, transition: { duration: 0.2 } },
};

const Registrati = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParamsReg] = useState(() => new URLSearchParams(location.search));
  const redirectTo = searchParamsReg.get("redirect") || "/";
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Handle navigation state for forgot password
  useEffect(() => {
    const state = location.state as { forgotPassword?: boolean } | null;
    if (state?.forgotPassword) {
      setActiveTab("login");
      setForgotPassword(true);
      // Clear the state to avoid re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", acceptPrivacy: false as boolean,
  });

  const clearMessages = () => {
    setErrors({});
    setGlobalMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoading(false);

    if (error) {
      setGlobalMessage({ type: "error", text: "Email o password non corretti" });
    } else {
      setGlobalMessage({ type: "success", text: "Accesso effettuato! Reindirizzamento..." });
      setTimeout(() => navigate(redirectTo), 1500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = registerSchema.safeParse(registerForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: {
        emailRedirectTo: "https://bazhousedemo.vercel.app",
        data: {
          first_name: registerForm.firstName,
          last_name: registerForm.lastName,
          phone: registerForm.phone,
        },
      },
    });
    setLoading(false);

    if (error) {
      setGlobalMessage({ type: "error", text: error.message });
    } else {
      setRegisteredEmail(registerForm.email);
      setRegistrationSuccess(true);
    }
  };

  const FieldError = ({ field }: { field: string }) => (
    <AnimatePresence>
      {errors[field] && (
        <motion.p
          variants={errorVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans"
        >
          <AlertCircle size={12} />
          {errors[field]}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <PageTransition>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-ocean/60" />
        </div>

        {/* Floating animated icons */}
        {floatingIcons.map(({ Icon, x, y, delay, size }, idx) => (
          <motion.div
            key={idx}
            className="absolute z-10 text-hero-text/15 pointer-events-none"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -12, 0],
            }}
            transition={{
              opacity: { delay: delay + 0.5, duration: 0.8 },
              scale: { delay: delay + 0.5, duration: 0.8, ease: "backOut" },
              y: { delay: delay + 1.3, duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {/* Form card */}
        <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-28">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Glass card */}
            <div className="relative bg-background/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Decorative top accent */}
              <motion.div
                className="h-1.5 bg-gradient-to-r from-primary via-ocean to-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />

              {forgotPassword ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="px-8 py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                  >
                    {forgotSent ? (
                      <Mail className="w-10 h-10 text-primary" />
                    ) : (
                      <Lock className="w-10 h-10 text-primary" />
                    )}
                  </motion.div>

                  {forgotSent ? (
                    <>
                      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-serif text-2xl text-foreground mb-3">
                        Email inviata!
                      </motion.h2>
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-sm font-sans mb-2 leading-relaxed">
                        Abbiamo inviato un link per reimpostare la password a
                      </motion.p>
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-foreground font-medium text-sm font-sans mb-6">
                        {forgotEmail}
                      </motion.p>
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-muted-foreground text-xs font-sans mb-8 leading-relaxed">
                        Clicca sul link nell'email per impostare una nuova password.<br />
                        Se non trovi l'email, controlla la cartella spam.
                      </motion.p>
                    </>
                  ) : (
                    <>
                      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-serif text-2xl text-foreground mb-3">
                        Password dimenticata?
                      </motion.h2>
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-sm font-sans mb-6 leading-relaxed">
                        Inserisci la tua email e ti invieremo un link per reimpostare la password.
                      </motion.p>

                      <AnimatePresence>
                        {globalMessage && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-sans ${globalMessage.type === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                              <AlertCircle size={16} />
                              {globalMessage.text}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onSubmit={async (e) => {
                          e.preventDefault();
                          clearMessages();
                          if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
                            setGlobalMessage({ type: "error", text: "Inserisci un indirizzo email valido" });
                            return;
                          }
                          setLoading(true);
                          const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                            redirectTo: "https://bazhousedemo.vercel.app/reset-password",
                          });
                          setLoading(false);
                          if (error) {
                            setGlobalMessage({ type: "error", text: error.message });
                          } else {
                            setForgotSent(true);
                          }
                        }}
                        className="space-y-4 text-left"
                      >
                        <div>
                          <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="email"
                              value={forgotEmail}
                              onChange={e => setForgotEmail(e.target.value)}
                              placeholder="tuaemail@esempio.com"
                              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                            />
                          </div>
                        </div>
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={!loading ? { scale: 1.02 } : {}}
                          whileTap={!loading ? { scale: 0.98 } : {}}
                          className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
                        >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Invia link<ArrowRight size={16} /></>}
                        </motion.button>
                      </motion.form>
                    </>
                  )}

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => { setForgotPassword(false); clearMessages(); }}
                    className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
                  >
                    ← Torna al login
                  </motion.button>
                </motion.div>
              ) : registrationSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="px-8 py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                  >
                    <Mail className="w-10 h-10 text-primary" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="font-serif text-2xl text-foreground mb-3"
                  >
                    Controlla la tua email
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground text-sm font-sans mb-2 leading-relaxed"
                  >
                    Abbiamo inviato un link di conferma a
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-foreground font-medium text-sm font-sans mb-6"
                  >
                    {registeredEmail}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-muted-foreground text-xs font-sans mb-8 leading-relaxed"
                  >
                    Clicca sul link nell'email per attivare il tuo account.<br />
                    Se non trovi l'email, controlla la cartella spam.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col gap-3"
                  >
                    <button
                      onClick={() => { setRegistrationSuccess(false); setActiveTab("login"); }}
                      className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:bg-primary/90"
                    >
                      <ArrowRight size={16} />
                      Vai al Login
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
                    >
                      Torna alla home
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <>
              {/* Header */}
              <motion.div
                className="h-1.5 bg-gradient-to-r from-primary via-ocean to-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />

              {/* Header */}
              <div className="px-8 pt-8 pb-2 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                >
                  <Waves className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-serif text-3xl text-foreground mb-1"
                >
                  Benvenuto in BAZHOUSE
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-muted-foreground text-sm"
                >
                  Il tuo angolo di paradiso a Boa Vista
                </motion.p>
              </div>

              {/* Global message */}
              <AnimatePresence>
                {globalMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-8"
                  >
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-sans ${
                      globalMessage.type === "success"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {globalMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      {globalMessage.text}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabs */}
              <div className="px-8 pt-4">
                <div className="relative flex bg-muted/70 rounded-full p-1 border border-border/30">
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-full bg-primary shadow-md"
                    initial={false}
                    animate={{
                      left: activeTab === "login" ? "4px" : "calc(50% + 0px)",
                      width: "calc(50% - 4px)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                  {(["login", "register"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); clearMessages(); }}
                      className={`relative z-10 flex-1 py-2.5 text-sm font-sans tracking-widest uppercase transition-colors duration-300 rounded-full ${
                        activeTab === tab ? "text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "login" ? "Accedi" : "Registrati"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form content with animated height */}
              <motion.div
                className="px-8 pb-8 pt-6 overflow-hidden"
                animate={{ height: "auto" }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {activeTab === "login" ? (
                    <motion.form
                      key="login"
                      variants={tabContentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4"
                      onSubmit={handleLogin}
                    >
                      {/* Email */}
                      <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Email
                        </label>
                        <div className={`relative group transition-all duration-300 ${focusedField === "login-email" ? "scale-[1.02]" : ""}`}>
                          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "login-email" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type="email"
                            value={loginForm.email}
                            onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="tuaemail@esempio.com"
                            onFocus={() => setFocusedField("login-email")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                        </div>
                        <FieldError field="email" />
                      </motion.div>

                      {/* Password */}
                      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Password
                        </label>
                        <div className={`relative group transition-all duration-300 ${focusedField === "login-pass" ? "scale-[1.02]" : ""}`}>
                          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "login-pass" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={loginForm.password}
                            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="••••••••"
                            onFocus={() => setFocusedField("login-pass")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={showPassword ? "open" : "closed"}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </motion.div>
                            </AnimatePresence>
                          </button>
                        </div>
                        <FieldError field="password" />
                      </motion.div>

                      {/* Forgot password */}
                      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible" className="text-right">
                        <button type="button" onClick={() => { setForgotPassword(true); clearMessages(); setForgotSent(false); setForgotEmail(""); }} className="text-xs text-ocean hover:text-primary transition-colors font-sans">
                          Password dimenticata?
                        </button>
                      </motion.div>

                      {/* Submit */}
                      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 30px -8px hsl(160 55% 16% / 0.4)" } : {}}
                          whileTap={!loading ? { scale: 0.98 } : {}}
                          className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              Accedi
                              <motion.span
                                className="inline-block"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <ArrowRight size={16} />
                              </motion.span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      variants={tabContentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4"
                      onSubmit={handleRegister}
                    >
                      {/* First Name + Last Name */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                          <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                            Nome
                          </label>
                          <div className={`relative transition-all duration-300 ${focusedField === "reg-firstName" ? "scale-[1.02]" : ""}`}>
                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-firstName" ? "text-primary" : "text-muted-foreground"}`} />
                            <input
                              type="text"
                              value={registerForm.firstName}
                              onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))}
                              placeholder="Mario"
                              onFocus={() => setFocusedField("reg-firstName")}
                              onBlur={() => setFocusedField(null)}
                              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                            />
                          </div>
                          <FieldError field="firstName" />
                        </motion.div>

                        <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                          <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                            Cognome
                          </label>
                          <div className={`relative transition-all duration-300 ${focusedField === "reg-lastName" ? "scale-[1.02]" : ""}`}>
                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-lastName" ? "text-primary" : "text-muted-foreground"}`} />
                            <input
                              type="text"
                              value={registerForm.lastName}
                              onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))}
                              placeholder="Rossi"
                              onFocus={() => setFocusedField("reg-lastName")}
                              onBlur={() => setFocusedField(null)}
                              className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                            />
                          </div>
                          <FieldError field="lastName" />
                        </motion.div>
                      </div>

                      {/* Email */}
                      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Email
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === "reg-email" ? "scale-[1.02]" : ""}`}>
                          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-email" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type="email"
                            value={registerForm.email}
                            onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="tuaemail@esempio.com"
                            onFocus={() => setFocusedField("reg-email")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                        </div>
                        <FieldError field="email" />
                      </motion.div>

                      {/* Phone */}
                      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Telefono
                        </label>
                        <div className={`transition-all duration-300 ${focusedField === "reg-phone" ? "scale-[1.02]" : ""}`}>
                          <PhonePrefixInput
                            value={registerForm.phone}
                            onChange={(v) => setRegisterForm(f => ({ ...f, phone: v }))}
                            onFocus={() => setFocusedField("reg-phone")}
                            onBlur={() => setFocusedField(null)}
                            focused={focusedField === "reg-phone"}
                          />
                        </div>
                        <FieldError field="phone" />
                      </motion.div>

                      {/* Password */}
                      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Password
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === "reg-pass" ? "scale-[1.02]" : ""}`}>
                          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-pass" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={registerForm.password}
                            onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="Min. 8 caratteri, 1 maiuscola, 1 numero"
                            onFocus={() => setFocusedField("reg-pass")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={showPassword ? "open" : "closed"}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </motion.div>
                            </AnimatePresence>
                          </button>
                        </div>
                        <FieldError field="password" />
                      </motion.div>

                      {/* Confirm Password */}
                      <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Conferma Password
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === "reg-confirm" ? "scale-[1.02]" : ""}`}>
                          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-confirm" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={registerForm.confirmPassword}
                            onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            placeholder="Ripeti la password"
                            onFocus={() => setFocusedField("reg-confirm")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-12 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={showConfirmPassword ? "open" : "closed"}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </motion.div>
                            </AnimatePresence>
                          </button>
                        </div>
                        <FieldError field="confirmPassword" />
                      </motion.div>

                      {/* Privacy checkbox */}
                      <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all duration-300">
                          <div className="relative mt-0.5 shrink-0">
                            <input
                              type="checkbox"
                              checked={registerForm.acceptPrivacy as boolean}
                              onChange={e => setRegisterForm(f => ({ ...f, acceptPrivacy: e.target.checked }))}
                              className="peer sr-only"
                            />
                            <div className={`w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center shadow-sm ${
                              registerForm.acceptPrivacy 
                                ? "bg-primary border-primary shadow-primary/25" 
                                : errors.acceptPrivacy 
                                  ? "border-destructive bg-destructive/10 shadow-destructive/10" 
                                  : "border-muted-foreground/40 bg-background group-hover:border-primary/60"
                            }`}>
                              <AnimatePresence>
                                {registerForm.acceptPrivacy && (
                                  <motion.svg
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    className="w-3.5 h-3.5 text-primary-foreground"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M2 6l3 3 5-5" />
                                  </motion.svg>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <span className="text-sm text-foreground/80 font-sans leading-relaxed">
                            Accetto la{" "}
                            <a href="/privacy-policy" target="_blank" onClick={e => e.stopPropagation()} className="text-primary hover:underline font-semibold">
                              Privacy Policy
                            </a>, il{" "}
                            <a href="/rental-agreement" target="_blank" onClick={e => e.stopPropagation()} className="text-primary hover:underline font-semibold">
                              Rental Agreement
                            </a>{" "}e la{" "}
                            <a href="/refund-policy" target="_blank" onClick={e => e.stopPropagation()} className="text-primary hover:underline font-semibold">
                              Refund &amp; Cancellation Policy
                            </a>{" "}
                            <span className="text-destructive">*</span>
                          </span>
                        </label>
                        <FieldError field="acceptPrivacy" />
                      </motion.div>

                      {/* Submit */}
                      <motion.div custom={6} variants={inputVariants} initial="hidden" animate="visible" className="pt-1">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 30px -8px hsl(160 55% 16% / 0.4)" } : {}}
                          whileTap={!loading ? { scale: 0.98 } : {}}
                          className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              Crea Account
                              <motion.span
                                className="inline-block"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Sparkles size={16} />
                              </motion.span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bottom quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="px-8 pb-6 text-center"
              >
                <p className="text-xs text-muted-foreground/70 font-sans flex items-center justify-center gap-1.5">
                  <MapPin size={12} />
                  Boa Vista, Capo Verde
                </p>
              </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Registrati;
