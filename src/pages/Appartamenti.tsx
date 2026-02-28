import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ApartmentsSection from "@/components/sections/ApartmentsSection";

const Appartamenti = () => (
  <PageTransition>
    <Navbar />
    <main className="pt-24">
      <ApartmentsSection />
    </main>
    <Footer />
  </PageTransition>
);

export default Appartamenti;
