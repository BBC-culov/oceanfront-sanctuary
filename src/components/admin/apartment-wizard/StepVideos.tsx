import { motion } from "framer-motion";
import { Loader2, Trash2, Video } from "lucide-react";

interface StepVideosProps {
  videos: string[];
  uploading: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (url: string) => void;
}

const StepVideos = ({ videos, uploading, onUpload, onRemove }: StepVideosProps) => (
  <div className="space-y-5">
    <motion.label
      className="relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors group"
      whileHover={{ scale: 1.01 }}
    >
      <input
        type="file"
        accept="video/*"
        multiple
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => onUpload(e.target.files)}
        disabled={uploading}
      />
      {uploading ? (
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
      ) : (
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Video className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
        </motion.div>
      )}
      <span className="font-sans text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {uploading ? "Caricamento video in corso..." : "Trascina o clicca per caricare video"}
      </span>
      <span className="font-sans text-xs text-muted-foreground mt-1">MP4, WebM — video house tour</span>
    </motion.label>

    {videos.length > 0 && (
      <div className="space-y-2">
        {videos.map((url, i) => (
          <motion.div
            key={url}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 bg-muted/30 rounded-md p-2 border border-border hover:border-primary/30 transition-colors"
          >
            <Video className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs text-muted-foreground truncate">Video {i + 1}</p>
            </div>
            <button
              onClick={() => onRemove(url)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    )}

    {videos.length === 0 && !uploading && (
      <p className="text-center font-sans text-sm text-muted-foreground py-4">Nessun video caricato</p>
    )}
  </div>
);

export default StepVideos;
