import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

const ProjectsSection = () => {
  const { data: projects, isLoading } = useProjects({ onlyPublished: true });

  return (
    <section id="progetti" className="py-24 lg:py-32 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            I nostri progetti
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Opportunità di investimento.
          </h2>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            Progetti immobiliari curati a Boa Vista. Ogni scheda mostra la posizione,
            i servizi inclusi e le modalità di acquisto.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <p className="font-sans text-sm text-muted-foreground">
              Nessun progetto disponibile al momento. Torna a trovarci presto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link to={`/compra/progetti/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                      <h3 className="font-serif text-2xl font-light mb-1">{p.title}</h3>
                      {p.subtitle && (
                        <p className="font-sans text-xs tracking-wide opacity-80">{p.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      {p.address && (
                        <p className="font-sans text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {p.address}
                        </p>
                      )}
                      {p.price && (
                        <p className="font-serif text-lg mt-1">
                          {p.price_label ? `${p.price_label} ` : ""}
                          € {p.price.toLocaleString("it-IT")}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
