import { motion } from "framer-motion";
import { Check, User, Plane, Receipt, ClipboardCheck } from "lucide-react";

const steps = [
  { label: "Ospiti", icon: User },
  { label: "Volo & Servizi", icon: Plane },
  { label: "Fatturazione", icon: Receipt },
  { label: "Riepilogo", icon: ClipboardCheck },
];

interface BookingStepIndicatorProps {
  currentStep: number;
}

const BookingStepIndicator = ({ currentStep }: BookingStepIndicatorProps) => {
  return (
    <div className="relative flex items-start justify-between w-full max-w-lg mx-auto">
      {/* Connecting line behind circles */}
      <div className="absolute top-5 left-[10%] right-[10%] h-px bg-border" />
      <motion.div
        className="absolute top-5 left-[10%] h-px bg-primary origin-left"
        initial={false}
        animate={{
          width: `${Math.min(currentStep / (steps.length - 1), 1) * 80}%`,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        const Icon = step.icon;

        return (
          <div key={step.label} className="relative z-10 flex flex-col items-center gap-2.5 w-20">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive || isCompleted ? 1 : 0.5,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isCompleted
                  ? "bg-primary"
                  : isActive
                  ? "bg-primary shadow-lg shadow-primary/20"
                  : "bg-muted"
              }`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                  strokeWidth={1.5}
                />
              )}
            </motion.div>
            <span
              className={`font-sans text-[10px] tracking-[0.12em] uppercase text-center leading-tight transition-colors duration-300 ${
                isActive ? "text-foreground font-medium" : isCompleted ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BookingStepIndicator;
