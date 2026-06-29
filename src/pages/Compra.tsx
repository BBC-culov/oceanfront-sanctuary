import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import CompraHeroSection from "@/components/sections/CompraHeroSection";
import BoaVistaDescriptionSection from "@/components/sections/BoaVistaDescriptionSection";
import ProjectsSection from "@/components/sections/ProjectsSection";

const Compra = () => (
  <PageTransition>
    <Seo
      title="Compra — Investimento immobiliare a Boa Vista | BAZHOUSE"
      description="Progetti immobiliari selezionati a Boa Vista. Investi in una casa al mare con la cura BAZHOUSE: rendita, lifestyle e gestione professionale."
    />
    <Navbar />
    <main>
      <CompraHeroSection />
      <BoaVistaDescriptionSection />
      <ProjectsSection />
    </main>
    <Footer />
  </PageTransition>
);

export default Compra;
