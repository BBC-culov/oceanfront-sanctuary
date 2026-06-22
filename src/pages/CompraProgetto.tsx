import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Check, Mail, Phone, ExternalLink, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import { useProject } from "@/hooks/useProjects";
import ProjectInquiryForm from "@/components/ProjectInquiryForm";
import { useState } from "react";

const CompraProgetto = () => {
  const { slug } = useParams();
  const { data: project, isLoading } = useProject(slug);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground font-sans text-sm">Caricamento…</div>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
          <h1 className="font-serif text-3xl">Progetto non trovato</h1>
          <Link to="/compra" className="font-sans text-sm underline">Torna ai progetti</Link>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  const mainImage = project.images[activeImage] ?? project.images[0];
  const googleMaps = project.google_maps_url ||
    (project.latitude && project.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`
      : project.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`
        : null);
  const appleMaps = project.apple_maps_url ||
    (project.latitude && project.longitude
      ? `https://maps.apple.com/?ll=${project.latitude},${project.longitude}`
      : project.address
        ? `https://maps.apple.com/?q=${encodeURIComponent(project.address)}`
        : null);

  return (
    <PageTransition>
      <Seo
        title={`${project.title} — Compra | BAZHOUSE`}
        description={project.subtitle ?? project.description?.slice(0, 155) ?? `${project.title} — progetto immobiliare a Boa Vista.`}
      />
      <Navbar />

      <main className="pt-24 pb-20 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            to="/compra"
            className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Tutti i progetti
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 max-w-4xl"
          >
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3 h-3" />
              <span className="font-sans text-[10px] tracking-widest uppercase">Investimento immobiliare</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-light mb-4 leading-tight break-words">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="font-sans text-lg text-muted-foreground mb-4 break-words">{project.subtitle}</p>
            )}
            {project.address && (
              <p className="font-sans text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{project.address}</span>
              </p>
            )}
          </motion.div>

          {/* Gallery */}
          {project.images.length > 0 && (
            <div className="mb-16">
              <div className="aspect-[16/9] bg-muted overflow-hidden rounded-sm mb-3">
                <img src={mainImage} alt={project.title} className="w-full h-full object-cover" />
              </div>
              {project.images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {project.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square overflow-hidden bg-muted rounded-sm transition-all ${
                        i === activeImage ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-14 min-w-0">
              {project.description && (
                <section>
                  <h2 className="font-serif text-2xl md:text-3xl mb-5 font-light">Il progetto</h2>
                  <div className="font-sans text-base text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                    {project.description}
                  </div>
                </section>
              )}

              {project.video_url && (
                <section>
                  <h2 className="font-serif text-2xl md:text-3xl mb-5 font-light">Video render</h2>
                  <div className="aspect-video bg-muted overflow-hidden rounded-sm">
                    <video src={project.video_url} controls className="w-full h-full object-cover" />
                  </div>
                </section>
              )}

              {project.included_services.length > 0 && (
                <section>
                  <h2 className="font-serif text-2xl md:text-3xl mb-5 font-light">Servizi inclusi</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {project.included_services.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 font-sans text-sm">
                        <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </span>
                        <span className="break-words">{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {project.purchase_info && (
                <section className="bg-secondary/40 border border-border rounded-sm p-6 md:p-8">
                  <h2 className="font-serif text-2xl md:text-3xl mb-5 font-light">Modalità di acquisto</h2>
                  <div className="font-sans text-base text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                    {project.purchase_info}
                  </div>
                </section>
              )}

              {(googleMaps || appleMaps) && (
                <section>
                  <h2 className="font-serif text-2xl md:text-3xl mb-5 font-light">Posizione</h2>
                  <div className="flex flex-wrap gap-3">
                    {googleMaps && (
                      <a
                        href={googleMaps}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase border border-border px-5 py-3 rounded-sm hover:bg-secondary transition-colors"
                      >
                        Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {appleMaps && (
                      <a
                        href={appleMaps}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase border border-border px-5 py-3 rounded-sm hover:bg-secondary transition-colors"
                      >
                        Apple Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 min-w-0">
              <div className="sticky top-24 space-y-6">
                <div className="border border-border rounded-sm bg-card shadow-sm overflow-hidden">
                  {project.price && (
                    <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-b border-border">
                      <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
                        {project.price_label || "Prezzo"}
                      </p>
                      <p className="font-serif text-3xl md:text-4xl font-light break-words">
                        € {project.price.toLocaleString("it-IT")}
                      </p>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-serif text-xl mb-4">Richiedi informazioni</h3>
                    <ProjectInquiryForm projectId={project.id} projectTitle={project.title} />
                  </div>
                  {(project.contact_email || project.contact_phone) && (
                    <div className="px-6 pb-6 pt-2 border-t border-border space-y-2.5 bg-secondary/20">
                      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground pt-4 mb-1">
                        Oppure contattaci
                      </p>
                      {project.contact_email && (
                        <a
                          href={`mailto:${project.contact_email}`}
                          className="flex items-center gap-2 font-sans text-sm hover:text-primary break-all"
                        >
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="break-all">{project.contact_email}</span>
                        </a>
                      )}
                      {project.contact_phone && (
                        <a
                          href={`tel:${project.contact_phone}`}
                          className="flex items-center gap-2 font-sans text-sm hover:text-primary"
                        >
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{project.contact_phone}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default CompraProgetto;
