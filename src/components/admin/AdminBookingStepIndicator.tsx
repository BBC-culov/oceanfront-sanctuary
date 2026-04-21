import { motion } from "framer-motion";
import { Check, UserCog, Building2, User, Plane, Receipt, ClipboardCheck } from "lucide-react";

const steps = [
  { label: "Cliente", icon: UserCog },
  { label: "Soggiorno", icon: Building2 },
  { label: "Ospiti", icon: User },
  { label: "Volo & Servizi", icon: Plane },
  { label: "Fatturazione", icon: Receipt },
  { label: "Riepilogo", icon: ClipboardCheck },
];

interface AdminBookingStepIndicatorProps {
  currentStep: number;
}

const AdminBookingStepIndicator = ({ currentStep }: AdminBookingStepIndicatorProps) => {
  return (
    <div className="relative flex items-start justify-between w-full max-w-2xl mx-auto">
      <div className="absolute top-5 left-[6%] right-[6%] h-px bg-border" />
      <motion.div
        className="absolute top-5 left-[6%] h-px bg-primary origin-left"
        initial={false}
        animate={{ width: `${Math.min(currentStep / (steps.length - 1), 1) * 88}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        const Icon = step.icon;
        return (
          <div key={step.label} className="relative z-10 flex flex-col items-center gap-2 w-16">
            <motion.div
              initial={false}
              animate={{ scale: isActive ? 1 : 0.9, opacity: isActive || isCompleted ? 1 : 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? "bg-primary" : isActive ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted"
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              ) : (
                <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={1.5} />
              )}
            </motion.div>
            <span className={`font-sans text-[9px] tracking-[0.1em] uppercase text-center leading-tight ${
              isActive ? "text-foreground font-medium" : isCompleted ? "text-primary font-medium" : "text-muted-foreground"
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AdminBookingStepIndicator;
