import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  Waves, Sun, Palmtree, Shell, Compass, Sparkles,
  Phone, MapPin
} from "lucide-react";
import Navbar from "@/components/Navbar";
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

const Registrati = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

              {/* Tabs */}
              <div className="px-8 pt-4">
                <div className="relative flex bg-muted rounded-xl p-1">
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-lg bg-background shadow-md"
                    initial={false}
                    animate={{
                      left: activeTab === "login" ? "4px" : "50%",
                      width: "calc(50% - 8px)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                  {(["login", "register"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative z-10 flex-1 py-2.5 text-sm font-sans tracking-wide uppercase transition-colors duration-300 ${
                        activeTab === tab ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {tab === "login" ? "Accedi" : "Registrati"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form content */}
              <div className="px-8 pb-8 pt-6">
                <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                    <motion.form
                      key="login"
                      variants={tabContentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4"
                      onSubmit={(e) => e.preventDefault()}
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
                            placeholder="tuaemail@esempio.com"
                            onFocus={() => setFocusedField("login-email")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                        </div>
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
                      </motion.div>

                      {/* Forgot password */}
                      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible" className="text-right">
                        <button type="button" className="text-xs text-ocean hover:text-primary transition-colors font-sans">
                          Password dimenticata?
                        </button>
                      </motion.div>

                      {/* Submit */}
                      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -8px hsl(160 55% 16% / 0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 group transition-all duration-300"
                        >
                          Accedi
                          <motion.span
                            className="inline-block"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <ArrowRight size={16} />
                          </motion.span>
                        </motion.button>
                      </motion.div>

                      {/* Divider */}
                      <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible" className="flex items-center gap-4 pt-2">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-sans">oppure</span>
                        <div className="flex-1 h-px bg-border" />
                      </motion.div>

                      {/* Social login */}
                      <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible" className="flex gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-3 rounded-lg border border-border bg-background text-foreground font-sans text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-3 rounded-lg border border-border bg-background text-foreground font-sans text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          Apple
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
                      onSubmit={(e) => e.preventDefault()}
                    >
                      {/* Name */}
                      <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Nome completo
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === "reg-name" ? "scale-[1.02]" : ""}`}>
                          <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-name" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type="text"
                            placeholder="Mario Rossi"
                            onFocus={() => setFocusedField("reg-name")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                        </div>
                      </motion.div>

                      {/* Email */}
                      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Email
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === "reg-email" ? "scale-[1.02]" : ""}`}>
                          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-email" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type="email"
                            placeholder="tuaemail@esempio.com"
                            onFocus={() => setFocusedField("reg-email")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                        </div>
                      </motion.div>

                      {/* Phone */}
                      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
                        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
                          Telefono
                        </label>
                        <div className={`relative transition-all duration-300 ${focusedField === "reg-phone" ? "scale-[1.02]" : ""}`}>
                          <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-phone" ? "text-primary" : "text-muted-foreground"}`} />
                          <input
                            type="tel"
                            placeholder="+39 333 123 4567"
                            onFocus={() => setFocusedField("reg-phone")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                          />
                        </div>
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
                            placeholder="Minimo 8 caratteri"
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
                      </motion.div>

                      {/* Submit */}
                      <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible" className="pt-1">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -8px hsl(160 55% 16% / 0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 group transition-all duration-300"
                        >
                          Crea Account
                          <motion.span
                            className="inline-block"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Sparkles size={16} />
                          </motion.span>
                        </motion.button>
                      </motion.div>

                      {/* Divider */}
                      <motion.div custom={6} variants={inputVariants} initial="hidden" animate="visible" className="flex items-center gap-4 pt-1">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-sans">oppure</span>
                        <div className="flex-1 h-px bg-border" />
                      </motion.div>

                      {/* Social */}
                      <motion.div custom={7} variants={inputVariants} initial="hidden" animate="visible" className="flex gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-3 rounded-lg border border-border bg-background text-foreground font-sans text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 py-3 rounded-lg border border-border bg-background text-foreground font-sans text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          Apple
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

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
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Registrati;
