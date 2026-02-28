import { useParams, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Users,
  BedDouble,
  Bath,
  Maximize,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import apartments from "@/data/apartments";

const AppartamentoDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const apt = apartments.find((a) => a.slug === slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!apt) return <Navigate to="/appartamenti" replace />;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + apt.gallery.length) % apt.gallery.length : null
    );
  const nextImage = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % apt.gallery.length : null
    );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${apt.mapQuery}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${apt.mapQuery}`;

  return (
    <PageTransition>
      <Navbar />
      <main className="pt-24">
        {/* Back link */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <Link
            to="/appartamenti"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Tutti gli appartamenti
          </Link>
        </div>

        {/* Hero gallery */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {apt.gallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`overflow-hidden cursor-pointer group ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
                onClick={() => openLightbox(i)}
              >
                <img
                  src={img}
                  alt={`${apt.name} — foto ${i + 1}`}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full" : "aspect-[4/3]"
                  }`}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Left: info */}
            <div className="lg:col-span-2 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  {apt.tagline}
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-light mb-6 text-foreground">
                  {apt.name}
                </h1>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-6 mb-8">
                  {[
                    { icon: Users, label: `${apt.guests} ospiti` },
                    {
                      icon: BedDouble,
                      label: `${apt.bedrooms} ${apt.bedrooms > 1 ? "camere" : "camera"}`,
                    },
                    {
                      icon: Bath,
                      label: `${apt.bathrooms} ${apt.bathrooms > 1 ? "bagni" : "bagno"}`,
                    },
                    { icon: Maximize, label: `${apt.sqm} m²` },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="font-sans text-sm">{label}</span>
                    </div>
                  ))}
                </div>

                <p className="font-sans text-base text-muted-foreground leading-relaxed">
                  {apt.description}
                </p>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <h2 className="font-serif text-2xl font-light mb-6 text-foreground">
                  Servizi inclusi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {apt.services.map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                      </div>
                      <span className="font-sans text-sm text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-8"
            >
              {/* Address card */}
              <div className="bg-secondary p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="font-sans text-sm text-foreground leading-relaxed">
                    {apt.address}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-4 py-3 hover:bg-primary/90 transition-colors"
                  >
                    Google Maps
                  </a>
                  <a
                    href={appleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center font-sans text-xs tracking-[0.15em] uppercase border border-primary text-primary px-4 py-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Apple Maps
                  </a>
                </div>
              </div>

              {/* CTA */}
              <Link to="/contatti">
                <motion.span
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="block text-center font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                >
                  Richiedi Disponibilità
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-background/80 hover:text-background transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 text-background/60 hover:text-background transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={apt.gallery[lightboxIndex]}
              alt={`${apt.name} — foto ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 text-background/60 hover:text-background transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 flex gap-2">
              {apt.gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === lightboxIndex ? "bg-background" : "bg-background/40"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </PageTransition>
  );
};

export default AppartamentoDetail;
