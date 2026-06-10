import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CalendarRange, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOwnerApartments } from "@/hooks/useOwnerData";
import AvailabilityManagerDialog from "@/components/admin/AvailabilityManagerDialog";

const ProprietarioDisponibilita = () => {
  const { data: apartments = [], isLoading } = useOwnerApartments();
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Disponibilità</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Blocca le date per uso personale o manutenzione. I periodi prenotati dagli ospiti non possono essere modificati.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apartments.map((a, i) => (
            <motion.button
              key={a.id}
              onClick={() => setSelected({ id: a.id, name: a.name })}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -2 }}
              className="text-left"
            >
              <Card className="hover:shadow-md transition-all hover:border-primary/40">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0">
                    {a.images[0] ? (
                      <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base text-foreground truncate">{a.name}</h3>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {a.category}
                    </p>
                  </div>
                  <CalendarRange className="w-5 h-5 text-primary shrink-0" />
                </CardContent>
              </Card>
            </motion.button>
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

export default ProprietarioDisponibilita;
