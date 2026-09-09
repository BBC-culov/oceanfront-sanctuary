import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Save, X } from "lucide-react";
import { useApartmentWizard } from "@/hooks/useApartmentWizard";
import { STEPS, slideVariants, type ApartmentForm } from "./apartment-wizard/types";
import StepIdentity from "./apartment-wizard/StepIdentity";
import StepSpaces from "./apartment-wizard/StepSpaces";
import StepDescription from "./apartment-wizard/StepDescription";
import StepImages from "./apartment-wizard/StepImages";
import StepVideos from "./apartment-wizard/StepVideos";
import StepDetails from "./apartment-wizard/StepDetails";

export type { ApartmentForm };

interface ApartmentWizardProps {
  initialData: ApartmentForm;
  initialServices: string;
  initialImages: string[];
  initialVideos: string[];
  isEditing: boolean;
  editName?: string;
  editId?: string;
  onSave: (form: ApartmentForm, servicesInput: string, images: string[], videos: string[]) => void;
  onClose: () => void;
}

const ApartmentWizard = ({
  initialData,
  initialServices,
  initialImages,
  initialVideos,
  isEditing,
  editName,
  editId,
  onSave,
  onClose,
}: ApartmentWizardProps) => {
  const w = useApartmentWizard({ initialData, initialServices, initialImages, initialVideos, editId, onSave });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="bg-background border-primary/20 overflow-hidden">
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <motion.h2
              className="font-serif text-2xl font-light text-foreground"
              key={isEditing ? "edit" : "create"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {isEditing ? `Modifica: ${editName}` : "Nuovo appartamento"}
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === w.step;
              const isDone = i < w.step;
              return (
                <motion.button
                  key={i}
                  onClick={() => w.goToStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-sans tracking-wide uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? "bg-primary text-primary-foreground shadow-md" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  animate={isActive ? { y: [0, -2, 0] } : {}}
                  transition={isActive ? { duration: 0.4 } : {}}
                >
                  {isDone ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.title}</span>
                </motion.button>
              );
            })}
          </div>
          <Progress value={w.progress} className="h-1 bg-muted" />
        </div>

        <CardContent className="pt-2 pb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={w.step}
              className="font-sans text-sm text-muted-foreground mb-6"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {STEPS[w.step].subtitle}
            </motion.p>
          </AnimatePresence>

          <div className="relative min-h-[260px]">
            <AnimatePresence mode="wait" custom={w.direction}>
              <motion.div
                key={w.step}
                custom={w.direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {w.step === 0 && <StepIdentity form={w.form} setForm={w.setForm} errors={w.errors} />}
                {w.step === 1 && <StepSpaces form={w.form} setForm={w.setForm} errors={w.errors} />}
                {w.step === 2 && <StepDescription form={w.form} setForm={w.setForm} />}
                {w.step === 3 && (
                  <StepImages images={w.images} setImages={w.setImages} uploading={w.uploading} onUpload={w.handleUpload} onRemove={w.removeImage} />
                )}
                {w.step === 4 && (
                  <StepVideos videos={w.videos} uploading={w.uploadingVideo} onUpload={w.handleVideoUpload} onRemove={w.removeVideo} />
                )}
                {w.step === 5 && (
                  <StepDetails form={w.form} setForm={w.setForm} servicesInput={w.servicesInput} setServicesInput={w.setServicesInput} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={w.step === 0 ? onClose : w.goPrev}
              className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <ArrowLeft className="w-4 h-4" />
              {w.step === 0 ? "Annulla" : "Indietro"}
            </motion.button>

            {w.isLastStep ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={w.handleSave}
                className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition-colors rounded-md shadow-md"
              >
                <Save className="w-4 h-4" />
                Salva
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={w.goNext}
                className="flex items-center gap-2 font-sans text-xs tracking-wider uppercase bg-primary text-primary-foreground px-6 py-2.5 hover:bg-primary/90 transition-colors rounded-md"
              >
                Avanti
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ApartmentWizard;
