import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import WhySection from "@/components/sections/WhySection";
import ApartmentsSection from "@/components/sections/ApartmentsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import BoaVistaSection from "@/components/sections/BoaVistaSection";

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <WhySection />
      <ApartmentsSection />
      <ExperienceSection />
      <BoaVistaSection />
    </main>
    <Footer />
  </>
);

export default Index;
