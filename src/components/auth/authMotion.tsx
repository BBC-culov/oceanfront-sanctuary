import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Compass, Palmtree, Shell, Sparkles, Sun, Waves } from "lucide-react";

// Shared motion presets + small presentational bits for the auth page.

export const floatingIcons = [
  { Icon: Waves, x: "10%", y: "20%", delay: 0, size: 28 },
  { Icon: Sun, x: "85%", y: "15%", delay: 0.5, size: 24 },
  { Icon: Palmtree, x: "90%", y: "60%", delay: 1, size: 30 },
  { Icon: Shell, x: "8%", y: "70%", delay: 1.5, size: 22 },
  { Icon: Compass, x: "50%", y: "85%", delay: 2, size: 26 },
  { Icon: Sparkles, x: "75%", y: "40%", delay: 0.8, size: 20 },
];

export const inputVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 * i, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export const tabContentVariants = {
  enter: { opacity: 0, y: 20, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
};

export const errorVariants = {
  hidden: { opacity: 0, height: 0, y: -5 },
  visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, height: 0, y: -5, transition: { duration: 0.2 } },
};

export const INPUT_CLASS =
  "w-full pl-10 pr-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300";

export const INPUT_CLASS_WITH_TOGGLE =
  "w-full pl-10 pr-12 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300";

export const FieldError = ({ errors, field }: { errors: Record<string, string>; field: string }) => (
  <AnimatePresence>
    {errors[field] && (
      <motion.p
        variants={errorVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans"
      >
        <AlertCircle size={12} />
        {errors[field]}
      </motion.p>
    )}
  </AnimatePresence>
);

export const FloatingIcons = () => (
  <>
    {floatingIcons.map(({ Icon, x, y, delay, size }, idx) => (
      <motion.div
        key={idx}
        className="absolute z-10 text-hero-text/15 pointer-events-none"
        style={{ left: x, top: y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
        transition={{
          opacity: { delay: delay + 0.5, duration: 0.8 },
          scale: { delay: delay + 0.5, duration: 0.8, ease: "backOut" },
          y: { delay: delay + 1.3, duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Icon size={size} />
      </motion.div>
    ))}
  </>
);
