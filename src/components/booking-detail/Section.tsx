import { motion } from "framer-motion";

/** Card section with icon header, used across the booking detail page. */
export const Section = ({
  icon: Icon, title, children, delay = 0,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground/70 font-medium">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

/** Label/value row; renders nothing when the value is empty. */
export const InfoRow = ({
  icon: Icon, label, value,
}: { icon?: React.ElementType; label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/15 last:border-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" strokeWidth={1.5} />}
      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
        <span className="font-sans text-xs text-muted-foreground">{label}</span>
        <span className="font-sans text-sm text-foreground font-medium text-right">{value}</span>
      </div>
    </div>
  );
};
