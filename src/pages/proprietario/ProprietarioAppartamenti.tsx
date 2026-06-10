import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Building2, BedDouble, Bath, Maximize2, Users, CalendarRange, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOwnerApartments } from "@/hooks/useOwnerData";
import AvailabilityManagerDialog from "@/components/admin/AvailabilityManagerDialog";
import { Link } from "react-router-dom";

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const ProprietarioAppartamenti = () => {
  const { data: apartments = [], isLoading } = useOwnerApartments();
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl text-foreground">I miei appartamenti</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Consulta i dettagli e gestisci la disponibilità di ciascuna residenza.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : apartments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-sans text-sm text-muted-foreground">
              Nessun appartamento associato al tuo account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {apartments.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] bg-muted">
                  {a.images[0] ? (
                    <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {!a.is_active && (
                    <span className="absolute top-2 right-2 font-sans text-[10px] uppercase tracking-wider px-2 py-1 bg-destructive/90 text-white rounded-sm">
                      Disattivato
                    </span>
                  )}
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{a.name}</h3>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {a.category} · {eur(Number(a.price_per_night))} / notte
                    </p>
                  </div>

                  {a.address && (
                    <p className="font-sans text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" /> {a.address}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs font-sans text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a.guests}</span>
                    <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {a.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {a.bathrooms}</span>
                    <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> {a.sqm} m²</span>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => setSelected({ id: a.id, name: a.name })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide px-3 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
                    >
                      <CalendarRange className="w-3.5 h-3.5" /> Disponibilità
                    </button>
                    <Link
                      to={`/appartamenti/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 font-sans text-xs uppercase tracking-wide px-3 py-2 border border-border text-foreground rounded-sm hover:bg-muted transition-colors"
                      title="Apri scheda pubblica"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <AvailabilityManagerDialog
          open={!!selected}
          onClose={() => setSelected(null)}
          apartmentId={selected.id}
          apartmentName={selected.name}
        />
      )}
    </div>
  );
};

export default ProprietarioAppartamenti;
