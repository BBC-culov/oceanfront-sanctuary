import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, MapPin, Waves } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import { FloatingIcons } from "@/components/auth/authMotion";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordPanel from "@/components/auth/ForgotPasswordPanel";
import RegistrationSuccessPanel from "@/components/auth/RegistrationSuccessPanel";
import { useAuthForms } from "@/hooks/useAuthForms";
import heroImg from "@/assets/boavista-sunset.jpg";

const Registrati = () => {
  const auth = useAuthForms();

  return (
    <PageTransition>
      <Seo
        title="Accedi o registrati | BAZHOUSE"
        description="Crea un account o accedi a BAZHOUSE per prenotare appartamenti vista oceano a Boa Vista e gestire i tuoi soggiorni."
        noindex
      />
      <Navbar />
      <main className="relative min-h-screen overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-ocean/60" />
        </div>

        <FloatingIcons />

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

              {auth.forgotPassword ? (
                <ForgotPasswordPanel
                  email={auth.forgotEmail}
                  setEmail={auth.setForgotEmail}
                  sent={auth.forgotSent}
                  loading={auth.loading}
                  globalMessage={auth.globalMessage}
                  onSubmit={auth.handleForgotSubmit}
                  onBack={auth.closeForgotPassword}
                />
              ) : auth.registrationSuccess ? (
                <RegistrationSuccessPanel
                  email={auth.registeredEmail}
                  onGoToLogin={auth.goToLoginAfterSignup}
                  onGoHome={() => auth.navigate("/")}
                />
              ) : (
                <>
                  {/* Header accent */}
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
                    {auth.globalMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-8"
                      >
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-sans ${
                          auth.globalMessage.type === "success"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {auth.globalMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          {auth.globalMessage.text}
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
                          left: auth.activeTab === "login" ? "4px" : "calc(50% + 0px)",
                          width: "calc(50% - 4px)",
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                      {(["login", "register"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => auth.selectTab(tab)}
                          className={`relative z-10 flex-1 py-2.5 text-sm font-sans tracking-widest uppercase transition-colors duration-300 rounded-full ${
                            auth.activeTab === tab ? "text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
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
                      {auth.activeTab === "login" ? (
                        <LoginForm
                          key="login"
                          form={auth.loginForm}
                          setForm={auth.setLoginForm}
                          errors={auth.errors}
                          loading={auth.loading}
                          onSubmit={auth.handleLogin}
                          onForgotPassword={auth.openForgotPassword}
                        />
                      ) : (
                        <RegisterForm
                          key="register"
                          form={auth.registerForm}
                          setForm={auth.setRegisterForm}
                          errors={auth.errors}
                          loading={auth.loading}
                          onSubmit={auth.handleRegister}
                        />
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
