import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo-bazhouse.png";

// Hero images to preload
import heroOcean from "@/assets/hero-ocean.jpg";
import heroAppartamenti from "@/assets/hero-appartamenti.jpg";
import heroServizi from "@/assets/hero-servizi.jpg";
import heroContatti from "@/assets/hero-contatti.jpg";

const imagesToPreload = [heroOcean, heroAppartamenti, heroServizi, heroContatti];

const preloadImages = (): Promise<void[]> =>
  Promise.all(
    imagesToPreload.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't block on error
          img.src = src;
        })
    )
  );

const SiteLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Start preloading images
    const imagePromise = preloadImages();

    // Animate progress while loading
    const steps = [10, 25, 40, 55, 70, 85];
    let i = 0;
    const interval = setInterval(() => {
      if (!cancelled && i < steps.length) {
        setProgress(steps[i]);
        i++;
      }
    }, 180);

    imagePromise.then(() => {
      if (cancelled) return;
      clearInterval(interval);
      setProgress(100);
      setTimeout(onComplete, 400);
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(42 60% 70% / 0.08) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Logo */}
      <motion.img
        src={logo}
        alt="BAZHOUSE"
        className="h-12 md:h-16 w-auto brightness-0 invert mb-10 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Progress bar */}
      <div className="relative z-10 w-48 md:w-56">
        <div className="h-px w-full bg-primary-foreground/20 overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <motion.p
          className="text-primary-foreground/40 font-sans text-[10px] tracking-[0.3em] uppercase text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Caricamento
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SiteLoader;
