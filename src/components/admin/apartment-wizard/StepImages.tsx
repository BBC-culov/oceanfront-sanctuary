import { motion, Reorder } from "framer-motion";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";

interface StepImagesProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  uploading: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (url: string) => void;
}

const StepImages = ({ images, setImages, uploading, onUpload, onRemove }: StepImagesProps) => (
  <div className="space-y-5">
    <motion.label
      className="relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors group"
      whileHover={{ scale: 1.01 }}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => onUpload(e.target.files)}
        disabled={uploading}
      />
      {uploading ? (
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
      ) : (
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
        </motion.div>
      )}
      <span className="font-sans text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {uploading ? "Caricamento in corso..." : "Trascina o clicca per caricare immagini"}
      </span>
      <span className="font-sans text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 5MB per file</span>
    </motion.label>

    {images.length > 0 && (
      <div>
        <p className="font-sans text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <GripVertical className="w-3 h-3" /> Trascina per riordinare — la prima immagine sarà la copertina
        </p>
        <Reorder.Group axis="y" values={images} onReorder={setImages} className="space-y-2">
          {images.map((url, i) => (
            <Reorder.Item
              key={url}
              value={url}
              className="flex items-center gap-3 bg-muted/30 rounded-md p-2 border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                {i === 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block font-sans text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded"
                  >
                    Copertina
                  </motion.span>
                )}
                <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">Immagine {i + 1}</p>
              </div>
              <button
                onClick={() => onRemove(url)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    )}

    {images.length === 0 && !uploading && (
      <p className="text-center font-sans text-sm text-muted-foreground py-4">Nessuna immagine caricata</p>
    )}
  </div>
);

export default StepImages;
