import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApartmentsSection from "@/components/sections/ApartmentsSection";

const Appartamenti = () => (
  <>
    <Navbar />
    <main className="pt-24">
      <ApartmentsSection />
    </main>
    <Footer />
  </>
);

export default Appartamenti;
