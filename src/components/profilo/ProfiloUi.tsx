import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { AlertCircle } from "lucide-react";

/** Section that fades in when scrolled into view. */
export const AnimatedSection = ({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/** Text input with focus glow and inline error. */
export const AnimatedInput = ({
  icon: Icon,
  label,
  error,
  delay = 0,
  className: extraClassName,
  ...props
}: {
  icon?: React.ElementType;
  label: string;
  error?: string;
  delay?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
    >
      <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      <motion.div
        className="relative"
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-3 rounded-lg bg-muted/50 border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-300 ${
            focused
              ? "border-primary/50 ring-2 ring-primary/20 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)]"
              : error
                ? "border-destructive/50"
                : "border-border"
          } ${extraClassName || ""}`}
        />
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-destructive text-xs mt-1 flex items-center gap-1 font-sans"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
