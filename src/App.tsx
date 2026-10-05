import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SiteLoader from "@/components/SiteLoader";
import WhatsAppButton from "@/components/WhatsAppButton";
import { initMetaPixel, trackPageView } from "@/lib/metaPixel";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import MaintenancePage from "@/components/MaintenancePage";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "./components/CookieBanner";

const Index = lazy(() => import("./pages/Index"));
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));
const Servizi = lazy(() => import("./pages/Servizi"));
const Appartamenti = lazy(() => import("./pages/Appartamenti"));
const Contatti = lazy(() => import("./pages/Contatti"));
const AppartamentoDetail = lazy(() => import("./pages/AppartamentoDetail"));
const Prenota = lazy(() => import("./pages/Prenota"));
const PrenotazioneDetail = lazy(() => import("./pages/PrenotazioneDetail"));
const PrenotazioneSuccesso = lazy(() => import("./pages/PrenotazioneSuccesso"));
const PagamentoFallito = lazy(() => import("./pages/PagamentoFallito"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Registrati = lazy(() => import("./pages/Registrati"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profilo = lazy(() => import("./pages/Profilo"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const RentalAgreement = lazy(() => import("./pages/RentalAgreement"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminPrenotazioni = lazy(() => import("./pages/admin/AdminPrenotazioni"));
const AdminAppartamenti = lazy(() => import("./pages/admin/AdminAppartamenti"));
const AdminGestione = lazy(() => import("./pages/admin/AdminGestione"));
const AdminProprietari = lazy(() => import("./pages/admin/AdminProprietari"));
const AdminGestioneSito = lazy(() => import("./pages/admin/AdminGestioneSito"));
const AdminServizi = lazy(() => import("./pages/admin/AdminServizi"));
const AdminPrenotazioneDetail = lazy(() => import("./pages/admin/AdminPrenotazioneDetail"));
const AdminPrenotazioneNuova = lazy(() => import("./pages/admin/AdminPrenotazioneNuova"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Riprendi = lazy(() => import("./pages/Riprendi"));
const ProprietarioLayout = lazy(() => import("./components/proprietario/ProprietarioLayout"));
const ProprietarioOverview = lazy(() => import("./pages/proprietario/ProprietarioOverview"));
const ProprietarioAppartamenti = lazy(() => import("./pages/proprietario/ProprietarioAppartamenti"));
const ProprietarioDisponibilita = lazy(() => import("./pages/proprietario/ProprietarioDisponibilita"));
const ProprietarioPrenotazioni = lazy(() => import("./pages/proprietario/ProprietarioPrenotazioni"));
const Compra = lazy(() => import("./pages/Compra"));
const CompraProgetto = lazy(() => import("./pages/CompraProgetto"));
const AdminProgetti = lazy(() => import("./pages/admin/AdminProgetti"));
const AdminRichiesteProgetti = lazy(() => import("./pages/admin/AdminRichiesteProgetti"));

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

  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/proprietario");

  // Meta Pixel: init (if consent already given) and fire PageView on route change
  useEffect(() => {
    initMetaPixel();
    trackPageView();
  }, [location.pathname]);

  // Show maintenance page for non-admin routes when maintenance is enabled
  if (!maintenanceLoading && maintenance.enabled && !isAdminRoute) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense fallback={null}>
          <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/servizi" element={<Servizi />} />
          <Route path="/affitta" element={<Navigate to="/appartamenti" replace />} />
          <Route path="/compra" element={<Compra />} />
          <Route path="/compra/progetti/:slug" element={<CompraProgetto />} />
          <Route path="/appartamenti" element={<Appartamenti />} />
          <Route path="/appartamenti/:slug" element={<AppartamentoDetail />} />
          <Route path="/prenota" element={<ErrorBoundary area="prenotazione" compact><Prenota /></ErrorBoundary>} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/registrati" element={<Registrati />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/rental-agreement" element={<RentalAgreement />} />
          <Route path="/prenotazione/:id" element={<ErrorBoundary area="prenotazione-dettaglio" compact><PrenotazioneDetail /></ErrorBoundary>} />
          <Route path="/prenotazione-successo/:id" element={<PrenotazioneSuccesso />} />
          <Route path="/pagamento-fallito" element={<PagamentoFallito />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/riprendi/:token" element={<Riprendi />} />
          {/* Admin routes */}
          <Route path="/admin" element={<ErrorBoundary area="admin" compact><AdminLayout /></ErrorBoundary>}>
            <Route index element={<AdminOverview />} />
            <Route path="prenotazioni" element={<AdminPrenotazioni />} />
            <Route path="prenotazioni/nuova" element={<AdminPrenotazioneNuova />} />
            <Route path="prenotazioni/:id" element={<AdminPrenotazioneDetail />} />
            <Route path="appartamenti" element={<AdminAppartamenti />} />
            <Route path="servizi" element={<AdminServizi />} />
            <Route path="progetti" element={<AdminProgetti />} />
            <Route path="richieste-progetti" element={<AdminRichiesteProgetti />} />
            <Route path="gestione" element={<AdminGestione />} />
            <Route path="proprietari" element={<AdminProprietari />} />
            <Route path="sito" element={<AdminGestioneSito />} />
          </Route>
          {/* Proprietario routes */}
          <Route path="/proprietario" element={<ErrorBoundary area="proprietario" compact><ProprietarioLayout /></ErrorBoundary>}>
            <Route index element={<ProprietarioOverview />} />
            <Route path="appartamenti" element={<ProprietarioAppartamenti />} />
            <Route path="disponibilita" element={<ProprietarioDisponibilita />} />
            <Route path="prenotazioni" element={<ProprietarioPrenotazioni />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
