import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Seo
        title="Pagina non trovata | Bazhouse"
        description="La pagina che stai cercando non esiste o è stata spostata."
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Pagina non trovata</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Torna alla home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
