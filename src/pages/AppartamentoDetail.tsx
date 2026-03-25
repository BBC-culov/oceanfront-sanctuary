import { useParams, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, MapPin, Users, BedDouble, Bath, Maximize,
  ChevronLeft, ChevronRight, X, Waves, TreePalm, CookingPot,
  Wifi, AirVent, Tv, ShieldCheck, CarFront, Droplets, Flame,
  Clapperboard, ConciergeBell, PlaneTakeoff, Clock, Play,
  type LucideIcon,
} from "lucide-react";

const serviceIconMap: Record<string, LucideIcon> = {
  "Vista oceano": Waves, "Terrazza privata": TreePalm, "Cucina attrezzata": CookingPot,
  "Wi-Fi ad alta velocità": Wifi, "Aria condizionata": AirVent, "Smart TV": Tv,
  "Biancheria premium": ShieldCheck, "Parcheggio incluso": CarFront, "Accesso piscina": Droplets,
  "Giardino privato": TreePalm, "Cucina completa": CookingPot, "Vasca idromassaggio": Droplets,
  "Barbecue esterno": Flame, "Piscina privata": Droplets, "Terrazza panoramica": TreePalm,
  "Cucina gourmet": CookingPot, "Home cinema": Clapperboard, "Concierge dedicato": ConciergeBell,
  "Transfer aeroporto": PlaneTakeoff,
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import staticApartments from "@/data/apartments";
import { useApartmentBySlug, useApartments } from "@/hooks/useApartments";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

const AppartamentoDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: dbApt, isLoading } = useApartmentBySlug(slug);
  const { data: allApartments = [] } = useApartments();
  const staticApt = staticApartments.find((a) => a.slug === slug);
  const apt = dbApt || staticApt;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Get alternative apartments (different from current, sorted by price ascending, take 2)
  const alternatives = allApartments
    .filter((a) => a.slug !== slug)
    .sort((a, b) => a.pricePerNight - b.pricePerNight)
    .slice(0, 2);

  if (isLoading) {
    return (
      <PageTransition>
        <Navbar />
        <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
          <p className="font-sans text-sm text-muted-foreground">Caricamento...</p>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (!apt) return <Navigate to="/appartamenti" replace />;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((prev) => prev !== null ? (prev - 1 + apt.gallery.length) % apt.gallery.length : null);
  const nextImage = () => setLightboxIndex((prev) => prev !== null ? (prev + 1) % apt.gallery.length : null);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${apt.mapQuery}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${apt.mapQuery}`;

  return (
    <PageTransition>
      <Navbar />
      <main className="pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <Link to="/appartamenti" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm">
            <ArrowLeft className="w-4 h-4" />
            Tutti gli appartamenti
          </Link>
        </div>

        {apt.gallery.length > 0 && (() => {
          const visibleImages = apt.gallery.slice(0, 3);
          const extraCount = apt.gallery.length - 3;
          return (
            <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {visibleImages.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`overflow-hidden cursor-pointer group relative ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                    onClick={() => openLightbox(i)}
                  >
                    <img
                      src={img}
                      alt={`${apt.name} — foto ${i + 1}`}
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full" : "aspect-[4/3]"}`}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    {i === 2 && extraCount > 0 && (
                      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center transition-colors group-hover:bg-foreground/50">
                        <span className="font-sans text-2xl font-light text-background">+{extraCount}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })()}

        <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">{apt.tagline}</p>
                <h1 className="font-serif text-4xl md:text-5xl font-light mb-6 text-foreground">{apt.name}</h1>
                <div className="flex flex-wrap gap-6 mb-8">
                  {[
                    { icon: Users, label: `${apt.guests} ospiti` },
                    { icon: BedDouble, label: `${apt.bedrooms} ${apt.bedrooms > 1 ? "camere" : "camera"}` },
                    { icon: Bath, label: `${apt.bathrooms} ${apt.bathrooms > 1 ? "bagni" : "bagno"}` },
                    { icon: Maximize, label: `${apt.sqm} m²` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="font-sans text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="font-sans text-base text-muted-foreground leading-relaxed">{apt.description}</p>

                {/* Check-in / Check-out times */}
                <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border/40">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="font-sans text-sm"><span className="font-medium text-foreground">Check-in:</span> {"checkInTime" in apt ? (apt as any).checkInTime : "15:00"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="font-sans text-sm"><span className="font-medium text-foreground">Check-out:</span> {"checkOutTime" in apt ? (apt as any).checkOutTime : "10:00"}</span>
                  </div>
                </div>
              </motion.div>

              {/* Video House Tour */}
              {apt.videos && apt.videos.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <h2 className="font-serif text-2xl font-light mb-6 text-foreground flex items-center gap-3">
                    <Play className="w-5 h-5 text-primary" />
                    Video House Tour
                  </h2>
                  <div className="space-y-4">
                    {apt.videos.map((videoUrl, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-foreground/5 border border-border/40">
                        <video
                          controls
                          preload="metadata"
                          className="w-full aspect-video"
                          poster=""
                        >
                          <source src={videoUrl} type="video/mp4" />
                          Il tuo browser non supporta la riproduzione video.
                        </video>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {apt.services.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}>
                  <h2 className="font-serif text-2xl font-light mb-6 text-foreground">Servizi inclusi</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {apt.services.map((s) => (
                      <div key={s} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {(() => { const Icon = serviceIconMap[s] || ShieldCheck; return <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />; })()}
                        </div>
                        <span className="font-sans text-sm text-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="space-y-8">
              {apt.address && (
                <div className="bg-secondary p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="font-sans text-sm text-foreground leading-relaxed">{apt.address}</p>
                  </div>
                  <div className="flex gap-3">
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-4 py-3 hover:bg-primary/90 transition-colors">Google Maps</a>
                    <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center font-sans text-xs tracking-[0.15em] uppercase border border-primary text-primary px-4 py-3 hover:bg-primary hover:text-primary-foreground transition-colors">Apple Maps</a>
                  </div>
                </div>
              )}
              <AvailabilityCalendar apartmentSlug={slug} apartmentId={"id" in apt ? (apt as any).id : undefined} />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Alternative apartments section */}
      {alternatives.length > 0 && (
        <section className="bg-background py-24 border-t border-border/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
            >
              <div>
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary mb-2">Esplora</p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground leading-tight">
                  Altre residenze
                </h2>
              </div>
              <Link to="/appartamenti">
                <motion.span
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase text-primary hover:text-primary/80 transition-colors"
                >
                  Vedi tutte
                  <ChevronRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
              {alternatives.map((alt, i) => (
                <motion.div
                  key={alt.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <Link to={`/appartamenti/${alt.slug}`} className="group block">
                    <div className="relative overflow-hidden">
                      <img
                        src={alt.cover}
                        alt={alt.name}
                        className="w-full aspect-[16/10] object-cover transition-all duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
                      {/* Price tag */}
                      {alt.pricePerNight > 0 && (
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                          <span className="font-sans text-xs font-semibold text-foreground">€{alt.pricePerNight}</span>
                          <span className="font-sans text-[10px] text-muted-foreground"> / notte</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-5 pb-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1.5">{alt.tagline}</p>
                          <h3 className="font-serif text-xl font-light text-foreground group-hover:text-primary transition-colors duration-300">{alt.name}</h3>
                        </div>
                        <motion.div
                          className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </motion.div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-muted-foreground font-sans text-xs">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{alt.guests}</span>
                        <span className="w-px h-3 bg-border" />
                        <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{alt.bedrooms}</span>
                        <span className="w-px h-3 bg-border" />
                        <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{alt.sqm} m²</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="font-serif text-2xl md:text-3xl font-light text-foreground mb-6">Pronto a vivere Boa Vista?</p>
          <Link to="/contatti">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-10 py-4 hover:bg-primary/90 transition-colors">Contattaci</motion.span>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-background/80 hover:text-background transition-colors"><X className="w-8 h-8" /></button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 md:left-8 text-background/60 hover:text-background transition-colors"><ChevronLeft className="w-10 h-10" /></button>
            <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} src={apt.gallery[lightboxIndex]} alt={`${apt.name} — foto ${lightboxIndex + 1}`} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 md:right-8 text-background/60 hover:text-background transition-colors"><ChevronRight className="w-10 h-10" /></button>
            <div className="absolute bottom-6 flex gap-2">
              {apt.gallery.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIndex ? "bg-background" : "bg-background/40"}`} />
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