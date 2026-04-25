import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SiteLoader from "@/components/SiteLoader";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import MaintenancePage from "@/components/MaintenancePage";
import Index from "./pages/Index";
import ChiSiamo from "./pages/ChiSiamo";
import Servizi from "./pages/Servizi";
import Appartamenti from "./pages/Appartamenti";
import Contatti from "./pages/Contatti";
import AppartamentoDetail from "./pages/AppartamentoDetail";
import Prenota from "./pages/Prenota";
import PrenotazioneDetail from "./pages/PrenotazioneDetail";
import PrenotazioneSuccesso from "./pages/PrenotazioneSuccesso";
import PagamentoFallito from "./pages/PagamentoFallito";
import NotFound from "./pages/NotFound";
import Registrati from "./pages/Registrati";
import ResetPassword from "./pages/ResetPassword";
import Profilo from "./pages/Profilo";
import Privacy from "./pages/Privacy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import RentalAgreement from "./pages/RentalAgreement";
import CookieBanner from "./components/CookieBanner";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminPrenotazioni from "./pages/admin/AdminPrenotazioni";
import AdminAppartamenti from "./pages/admin/AdminAppartamenti";
import AdminGestione from "./pages/admin/AdminGestione";
import AdminGestioneSito from "./pages/admin/AdminGestioneSito";
import AdminServizi from "./pages/admin/AdminServizi";
import AdminPrenotazioneDetail from "./pages/admin/AdminPrenotazioneDetail";
import AdminPrenotazioneNuova from "./pages/admin/AdminPrenotazioneNuova";
import Unsubscribe from "./pages/Unsubscribe";
import Riprendi from "./pages/Riprendi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — dati "freschi", nessun refetch
      gcTime: 30 * 60 * 1000,     // 30 min in cache
      refetchOnWindowFocus: false, // evita refetch al focus della finestra
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();
  const { maintenance, loading: maintenanceLoading } = useMaintenanceMode();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Show maintenance page for non-admin routes when maintenance is enabled
  if (!maintenanceLoading && maintenance.enabled && !isAdminRoute) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/servizi" element={<Servizi />} />
          <Route path="/appartamenti" element={<Appartamenti />} />
          <Route path="/appartamenti/:slug" element={<AppartamentoDetail />} />
          <Route path="/prenota" element={<Prenota />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/registrati" element={<Registrati />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/rental-agreement" element={<RentalAgreement />} />
          <Route path="/prenotazione/:id" element={<PrenotazioneDetail />} />
          <Route path="/prenotazione-successo/:id" element={<PrenotazioneSuccesso />} />
          <Route path="/pagamento-fallito" element={<PagamentoFallito />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/riprendi/:token" element={<Riprendi />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="prenotazioni" element={<AdminPrenotazioni />} />
            <Route path="prenotazioni/nuova" element={<AdminPrenotazioneNuova />} />
            <Route path="prenotazioni/:id" element={<AdminPrenotazioneDetail />} />
            <Route path="appartamenti" element={<AdminAppartamenti />} />
            <Route path="servizi" element={<AdminServizi />} />
            <Route path="gestione" element={<AdminGestione />} />
            <Route path="sito" element={<AdminGestioneSito />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <CookieBanner />}
    </>
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
