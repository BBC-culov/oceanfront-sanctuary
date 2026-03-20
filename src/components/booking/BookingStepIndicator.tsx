import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  label: string;
  icon: string;
}

const steps: Step[] = [
  { label: "Dati ospiti", icon: "1" },
  { label: "Volo e servizi", icon: "2" },
  { label: "Fatturazione", icon: "3" },
  { label: "Riepilogo", icon: "4" },
];

interface BookingStepIndicatorProps {
  currentStep: number;
}

const BookingStepIndicator = ({ currentStep }: BookingStepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? "hsl(var(--primary))"
                    : isActive
                    ? "hsl(var(--primary))"
                    : "hsl(var(--secondary))",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <span
                    className={`font-sans text-sm font-medium ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </span>
                )}
              </motion.div>
              <span
                className={`font-sans text-[10px] tracking-wider uppercase whitespace-nowrap ${
                  isActive || isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-3 mt-[-20px]">
                <motion.div
                  initial={false}
                  animate={{
                    scaleX: isCompleted ? 1 : 0,
                    backgroundColor: "hsl(var(--primary))",
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="h-full origin-left bg-border"
                  style={{ backgroundColor: isCompleted ? undefined : "hsl(var(--border))" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookingStepIndicator;
