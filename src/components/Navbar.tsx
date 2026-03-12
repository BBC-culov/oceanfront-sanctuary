import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import logo from "@/assets/logo-bazhouse.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Appartamenti", to: "/appartamenti" },
  { label: "Servizi", to: "/servizi" },
  { label: "Chi Siamo", to: "/chi-siamo" },
  { label: "Contatti", to: "/contatti" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const mainPages = ["/", "/appartamenti", "/servizi", "/chi-siamo", "/contatti"];
  const noHero = !mainPages.includes(location.pathname);
  const isTransparent = !noHero && !scrolled;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? "bg-primary/50 backdrop-blur-sm lg:bg-primary/30 lg:backdrop-blur-[2px]"
          : "bg-background/95 backdrop-blur-md shadow-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/" className="flex-shrink-0">
          <img
            src={logo}
            alt="BAZHOUSE"
            className={`h-8 lg:h-10 w-auto transition-all duration-500 ${
              isTransparent ? "brightness-0 invert" : ""
            }`}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-sans text-sm tracking-widest uppercase transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-[-4px] after:left-0 after:transition-transform after:duration-300 hover:after:scale-x-100 after:origin-bottom-left ${
                isTransparent
                  ? location.pathname === link.to
                    ? "text-hero-text after:bg-hero-text"
                    : "text-hero-text-muted hover:text-hero-text after:bg-hero-text"
                  : location.pathname === link.to
                    ? "text-foreground after:bg-foreground"
                    : "text-muted-foreground hover:text-foreground after:bg-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profilo"
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isTransparent
                    ? "text-hero-text hover:bg-hero-text/10"
                    : "text-foreground hover:bg-muted"
                }`}
                aria-label="Profilo"
              >
                <UserCircle size={22} />
              </Link>
              <button
                onClick={handleLogout}
                className={`inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  !isTransparent
                    ? "border-foreground/30 text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    : "border-hero-cta-border/40 text-hero-text hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                }`}
              >
                <LogOut size={14} />
                Esci
              </button>
            </>
          ) : (
            <Link
              to="/registrati"
              className={`inline-flex font-sans text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-300 hover:scale-105 active:scale-95 ${
                !isTransparent
                  ? "border-foreground/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  : "border-hero-cta-border/40 text-hero-text hover:bg-hero-cta hover:text-hero-cta-foreground hover:border-hero-cta"
              }`}
            >
              Accedi / Registrati
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden transition-colors duration-300 ${isTransparent ? "text-hero-text" : "text-foreground"}`}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 backdrop-blur-md border-t border-border"
          >
            <div className="flex flex-col items-center gap-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans text-sm tracking-widest uppercase text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/profilo"
                    className="font-sans text-sm tracking-widest uppercase text-foreground inline-flex items-center gap-2"
                  >
                    <UserCircle size={16} />
                    Profilo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="font-sans text-xs tracking-widest uppercase border border-destructive/30 text-destructive px-5 py-2.5 mt-2 inline-flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Esci
                  </button>
                </>
              ) : (
                <Link
                  to="/registrati"
                  className="font-sans text-xs tracking-widest uppercase border border-foreground/30 px-5 py-2.5 mt-2"
                >
                  Accedi / Registrati
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
