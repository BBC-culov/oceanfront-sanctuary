import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, UserCircle, User, CalendarDays, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";
import logo from "@/assets/logo-bazhouse.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Appartamenti", to: "/appartamenti" },
  { label: "Servizi", to: "/servizi" },
  { label: "Chi Siamo", to: "/chi-siamo" },
  { label: "Contatti", to: "/contatti" },
];

const dropdownItems = [
  { label: "Profilo", to: "/profilo", icon: User },
  { label: "Gestisci prenotazioni", to: "/profilo#prenotazioni", icon: CalendarDays },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainPages = ["/", "/appartamenti", "/servizi", "/chi-siamo", "/contatti"];
  const noHero = !mainPages.includes(location.pathname);
  const isTransparent = !noHero && !scrolled;

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      setIsAdmin(!!data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
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

        {/* Desktop nav links */}
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

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isTransparent
                    ? "text-hero-text hover:bg-hero-text/10"
                    : "text-foreground hover:bg-muted"
                } ${dropdownOpen ? (isTransparent ? "bg-hero-text/10" : "bg-muted") : ""}`}
                aria-label="Menu utente"
              >
                <UserCircle size={24} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
                    className="absolute right-0 top-full mt-3 w-60 bg-popover rounded-xl border border-border shadow-2xl overflow-hidden ring-1 ring-black/5"
                  >
                    {/* User email header */}
                    <div className="px-4 py-3 border-b border-border/40">
                      <p className="font-sans text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="py-1.5">
                      {isAdmin && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0, duration: 0.2 }}
                        >
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-primary font-medium hover:bg-primary/10 transition-colors duration-200"
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                        </motion.div>
                      )}
                      {dropdownItems.map((item, idx) => (
                        <motion.div
                          key={item.to}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * (idx + (isAdmin ? 1 : 0)), duration: 0.2 }}
                        >
                          <Link
                            to={item.to}
                            className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-foreground hover:bg-muted/60 transition-colors duration-200"
                          >
                            <item.icon size={16} className="text-muted-foreground" />
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t border-border/40 py-1.5">
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 font-sans text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200"
                      >
                        <LogOut size={16} />
                        Esci
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                    <User size={16} />
                    Profilo
                  </Link>
                  <Link
                    to="/profilo#prenotazioni"
                    className="font-sans text-sm tracking-widest uppercase text-foreground inline-flex items-center gap-2"
                  >
                    <CalendarDays size={16} />
                    Prenotazioni
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
