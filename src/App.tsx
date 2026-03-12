import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SiteLoader from "@/components/SiteLoader";
import Index from "./pages/Index";
import ChiSiamo from "./pages/ChiSiamo";
import Servizi from "./pages/Servizi";
import Appartamenti from "./pages/Appartamenti";
import Contatti from "./pages/Contatti";
import AppartamentoDetail from "./pages/AppartamentoDetail";
import NotFound from "./pages/NotFound";
import Registrati from "./pages/Registrati";
import ResetPassword from "./pages/ResetPassword";
import Profilo from "./pages/Profilo";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/chi-siamo" element={<ChiSiamo />} />
        <Route path="/servizi" element={<Servizi />} />
        <Route path="/appartamenti" element={<Appartamenti />} />
        <Route path="/appartamenti/:slug" element={<AppartamentoDetail />} />
        <Route path="/contatti" element={<Contatti />} />
        <Route path="/registrati" element={<Registrati />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profilo" element={<Profilo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const handleComplete = useCallback(() => setLoading(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence>
          {loading && <SiteLoader onComplete={handleComplete} />}
        </AnimatePresence>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
