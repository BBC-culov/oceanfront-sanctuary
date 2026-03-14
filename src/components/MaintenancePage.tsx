import { Wrench } from "lucide-react";
import { useEffect, useState } from "react";

const MaintenancePage = ({ message }: { message: string }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Simple CSS animated background */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse [animation-delay:1s]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg animate-fade-in">
        {/* Icon */}
        <div className="mx-auto mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Wrench className="w-10 h-10 text-primary animate-spin [animation-duration:8s]" />
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
          Manutenzione in corso
        </h1>

        <p className="font-sans text-base text-muted-foreground leading-relaxed mb-8">
          {message}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-sans text-sm text-muted-foreground">
            Lavori in corso{dots}
          </span>
        </div>

        <p className="font-sans text-xs text-muted-foreground/50 mt-12">
          BAZHOUSE — Torneremo presto
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
