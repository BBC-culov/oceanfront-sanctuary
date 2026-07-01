import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import HeroSection from "@/components/sections/HeroSection";
import WhySection from "@/components/sections/WhySection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import BoaVistaSection from "@/components/sections/BoaVistaSection";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Dove si trovano gli appartamenti Bazhouse?",
      acceptedAnswer: { "@type": "Answer", text: "Gli appartamenti Bazhouse si trovano a Boa Vista, Capo Verde, tra Praia Cabral e Praia da Cruz, direttamente vista oceano." },
    },
    {
      "@type": "Question",
      name: "Il transfer da e per l'aeroporto è incluso?",
      acceptedAnswer: { "@type": "Answer", text: "Sì, per tutti i soggiorni Bazhouse il transfer aeroportuale è incluso nel prezzo." },
    },
    {
      "@type": "Question",
      name: "Come funziona la prenotazione?",
      acceptedAnswer: { "@type": "Answer", text: "Si versa il 20% come caparra online con Stripe e il saldo dell'80% tramite link di pagamento sicuro nei giorni precedenti al check-in." },
    },
    {
      "@type": "Question",
      name: "È possibile acquistare un appartamento a Boa Vista?",
      acceptedAnswer: { "@type": "Answer", text: "Sì, nella sezione Compra puoi consultare i progetti immobiliari disponibili con la possibilità di richiedere una consulenza dedicata." },
    },
  ],
};

const Index = () => (
  <PageTransition>
    <Seo
      title="Bazhouse — Appartamenti vista oceano a Boa Vista, Capo Verde"
      description="Appartamenti esclusivi vista oceano a Boa Vista, Capo Verde. Praia Cabral e Praia da Cruz: indipendenza totale, transfer incluso e servizi premium."
      jsonLd={faqJsonLd}
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
