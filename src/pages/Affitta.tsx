import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import HeroSection from "@/components/sections/HeroSection";
import WhySection from "@/components/sections/WhySection";
import ApartmentsSection from "@/components/sections/ApartmentsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import BoaVistaSection from "@/components/sections/BoaVistaSection";

const affittaHeadlines = [
  "Affitta residenze esclusive vista oceano a Boa Vista.",
  "Appartamenti in affitto a Praia Cabral e Praia da Cruz, vista Atlantico.",
  "Soggiorni indipendenti a Boa Vista: penthouse e compact vista mare.",
];

const Affitta = () => (
  <PageTransition>
    <Seo
      title="Affitta — BAZHOUSE Boa Vista"
      description="Appartamenti vista oceano in affitto a Boa Vista: residenze, penthouse e compact. Calendario disponibilità, servizi premium, indipendenza totale."
    />
    <Navbar />
    <main>
      <HeroSection headlines={affittaHeadlines} />

      <WhySection />
      <ApartmentsSection />
      <ExperienceSection />
      <BoaVistaSection />
    </main>
    <Footer />
  </PageTransition>
);

export default Affitta;
