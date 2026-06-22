import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
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
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <Link
                  to={`/compra/progetti/${p.slug}`}
                  className="block bg-background border border-border/60 rounded-sm overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

                    {/* Top badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="font-sans text-[10px] tracking-widest uppercase">Investimento</span>
                    </div>

                    {/* Bottom title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                      <h3 className="font-serif text-2xl md:text-3xl font-light mb-1 leading-tight">
                        {p.title}
                      </h3>
                      {p.subtitle && (
                        <p className="font-sans text-xs tracking-wide opacity-90 line-clamp-1">
                          {p.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {p.address && (
                        <p className="font-sans text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{p.address}</span>
                        </p>
                      )}
                      {p.price && (
                        <p className="font-serif text-xl mt-1.5 text-foreground">
                          {p.price_label ? (
                            <span className="text-xs font-sans uppercase tracking-wider text-muted-foreground mr-1">
                              {p.price_label}
                            </span>
                          ) : null}
                          € {p.price.toLocaleString("it-IT")}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
