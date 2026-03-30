import { Link } from "react-router-dom";
import logo from "@/assets/logo-bazhouse.png";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <img src={logo} alt="BAZHOUSE" className="h-8 mb-6 brightness-0 invert" />
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
              { label: "Appartamenti", to: "/appartamenti" },
              { label: "Servizi", to: "/servizi" },
              { label: "Chi Siamo", to: "/chi-siamo" },
              { label: "Contatti", to: "/contatti" },
              { label: "Privacy Policy", to: "/privacy" },
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
            <p className="mt-4">info@bazhouse.it</p>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-primary-foreground/20 text-center">
        <p className="font-sans text-xs opacity-50">
          © {new Date().getFullYear()} BAZHOUSE — Un progetto EasyClick / Rilab
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
