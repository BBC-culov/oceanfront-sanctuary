import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import HeroSection from "@/components/sections/HeroSection";
import WhySection from "@/components/sections/WhySection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import BoaVistaSection from "@/components/sections/BoaVistaSection";

const Index = () => (
  <PageTransition>
    <Seo
      title="BAZHOUSE — Appartamenti vista oceano a Boa Vista"
      description="Appartamenti esclusivi vista oceano a Boa Vista, Capo Verde. Praia Cabral e Praia da Cruz: indipendenza totale e servizi premium."
    />
    <Navbar />
    <main>
      <HeroSection />
      <WhySection />
      <ExperienceSection />

      <BoaVistaSection />
    </main>
    <Footer />
  </PageTransition>
);

export default Index;
