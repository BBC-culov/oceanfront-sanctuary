import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Pencil,
  Trash2,
  EyeOff,
  CheckCircle2,
  CalendarRange,
  Star,
  GripVertical,
} from "lucide-react";

export interface ApartmentCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_per_night: number;
  guests: number;
  sqm: number;
  is_active: boolean;
  is_featured?: boolean;
  images?: string[];
}

interface Props {
  apt: ApartmentCardData;
  isActiveTab: boolean;
  onEdit: (apt: any) => void;
  onAvailability: (apt: any) => void;
  onToggleActive: (apt: any) => void;
  onToggleFeatured: (apt: any) => void;
  onDelete: (id: string, name: string) => void;
}

const SortableApartmentCard = ({
  apt,
  isActiveTab,
  onEdit,
  onAvailability,
  onToggleActive,
  onToggleFeatured,
  onDelete,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: apt.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`relative bg-background overflow-hidden group hover:shadow-lg transition-all duration-300 ${
            !isActiveTab ? "opacity-70" : ""
          } ${apt.is_featured ? "ring-2 ring-primary/40" : ""}`}
        >
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover:opacity-100"
            title="Trascina per riordinare"
            aria-label="Sposta appartamento"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Featured badge */}
          {apt.is_featured && (
            <div className="absolute top-2 right-2 z-20">
              <span className="flex items-center gap-1 font-sans text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-primary text-primary-foreground shadow-md">
                <Star className="w-3 h-3 fill-current" /> In evidenza
              </span>
            </div>
          )}

          {/* Image cover */}
          <div className="relative h-36 bg-muted overflow-hidden">
            {apt.images && apt.images.length > 0 ? (
              <motion.img
                src={apt.images[0]}
                alt={apt.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute bottom-2 left-2">
              <span className="inline-block font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground">
                {apt.category}
              </span>
            </div>
          </div>

          <CardContent className="pt-4 pb-4">
            <h3 className="font-serif text-lg text-foreground">{apt.name}</h3>
            <p className="font-sans text-xs text-muted-foreground mt-0.5">{apt.slug}</p>

            <div className="flex items-center gap-3 mt-3 font-sans text-xs text-muted-foreground">
              <span>€{apt.price_per_night}/notte</span>
              <span className="text-border">·</span>
              <span>{apt.guests} ospiti</span>
              <span className="text-border">·</span>
              <span>{apt.sqm}mq</span>
            </div>

            <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(apt)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                title="Modifica"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAvailability(apt)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                title="Disponibilità"
              >
                <CalendarRange className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleFeatured(apt)}
                className={`p-2 transition-colors rounded-md ${
                  apt.is_featured
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                }`}
                title={apt.is_featured ? "Rimuovi dall'evidenza" : "Metti in evidenza"}
              >
                <Star className={`w-4 h-4 ${apt.is_featured ? "fill-current" : ""}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleActive(apt)}
                className={`p-2 transition-colors rounded-md ${
                  isActiveTab
                    ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:text-success hover:bg-success/10"
                }`}
                title={isActiveTab ? "Disattiva" : "Attiva"}
              >
                {isActiveTab ? <EyeOff className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(apt.id, apt.name)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 ml-auto"
                title="Elimina"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SortableApartmentCard;
