import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export const fieldLabel = "font-sans text-xs text-muted-foreground uppercase tracking-wider mb-1 block";

export const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 font-sans text-xs text-destructive mt-1"
    >
      <AlertCircle className="w-3 h-3" />
      {message}
    </motion.p>
  );
};
