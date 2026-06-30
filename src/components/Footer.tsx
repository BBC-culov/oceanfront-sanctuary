import { Link } from "react-router-dom";
const logoWhite = { url: "/logo-bazhouse-white.png" };

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <img src={logoWhite.url} alt="BAZHOUSE" className="h-12 w-auto mb-6" />

          <p className="font-sans text-sm leading-relaxed opacity-70">
            Appartamenti esclusivi vista oceano a Boa Vista, Capo Verde.
            Praia Cabral & Praia da Cruz.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-4">Navigazione</h4>
          <div className="flex flex-col gap-2">
            {[
              { label: "Home", to: "/" },
              { label: "Servizi", to: "/servizi" },
              { label: "Chi Siamo", to: "/chi-siamo" },
              { label: "Contatti", to: "/contatti" },
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Rental Agreement", to: "/rental-agreement" },
              { label: "Refund Policy", to: "/refund-policy" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-sans text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-serif text-lg mb-4">Contatti</h4>
          <div className="font-sans text-sm space-y-2 opacity-70">
            <p>Praia Cabral & Praia da Cruz</p>
            <p>Boa Vista, Capo Verde</p>
            <p className="mt-4">info@easyclickweb.com</p>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-primary-foreground/20 text-center space-y-2">
        <p className="font-sans text-xs opacity-50">
          © {new Date().getFullYear()} BAZHOUSE — Un progetto EasyClick / Rilab
        </p>
        <p className="font-sans text-xs opacity-40">
          Site made by{" "}
          <a
            href="https://studionavi.it"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 hover:underline transition-opacity"
          >
            Studionavi.it
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
