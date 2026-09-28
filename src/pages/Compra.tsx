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
      title="Comprare Casa a Boa Vista, Capo Verde | Investimenti BAZHOUSE"
      description="Progetti immobiliari selezionati a Boa Vista. Investi in una casa al mare con la cura BAZHOUSE: rendita, lifestyle e gestione professionale."
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Progetti immobiliari a Boa Vista — BAZHOUSE",
        url: "https://bazhouse.com/compra",
        description:
          "Progetti immobiliari selezionati a Boa Vista, Capo Verde: acquisto, rendita e gestione professionale con BAZHOUSE.",
        isPartOf: { "@id": "https://bazhouse.com/#website" },
      }}
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
