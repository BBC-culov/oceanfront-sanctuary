// Photo / video / brochure uploads for the admin project form (same limits and messages as before).
import { useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { buildMediaPath, uploadImage, uploadPdf, uploadVideo } from "@/lib/mediaStorage";
import type { ProjectRow } from "@/hooks/useAdminProjects";
import {
  MAX_IMAGE_MB, MAX_VIDEO_MB, MAX_BROCHURE_MB, MAX_IMAGES,
  ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_BROCHURE_TYPES,
} from "@/lib/projectForm";

export function useProjectMediaUpload(
  editing: Partial<ProjectRow> | null,
  setEditing: Dispatch<SetStateAction<Partial<ProjectRow> | null>>,
) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || !editing) return;
    const currentCount = (editing.images ?? []).length;
    const remaining = MAX_IMAGES - currentCount;
    if (remaining <= 0) {
      toast.error(`Limite massimo di ${MAX_IMAGES} foto raggiunto`);
      return;
    }
    setUploadingImages(true);
    const filesArr = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Caricate solo ${remaining} foto (limite ${MAX_IMAGES} totali)`);
    }

    const valid: File[] = [];
    for (const file of filesArr) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`"${file.name}": formato non supportato (jpg, png, webp, avif)`);
        continue;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`"${file.name}": supera ${MAX_IMAGE_MB}MB`);
        continue;
      }
      valid.push(file);
    }

    const results = await Promise.all(
      valid.map(async (file) => {
        const { url, error } = await uploadImage(buildMediaPath("projects", file.name), file, {
          upsert: false,
          contentType: file.type,
        });
        if (error) {
          toast.error(`Upload "${file.name}" fallito: ${error}`);
          return null;
        }
        return url ?? null;
      })
    );

    const newUrls = results.filter((u): u is string => !!u);
    if (newUrls.length > 0) {
      setEditing((prev) => (prev ? { ...prev, images: [...(prev.images ?? []), ...newUrls] } : prev));
      toast.success(`${newUrls.length} foto caricate`);
    }
    setUploadingImages(false);
  };

  const handleUploadBrochure = async (file: File | null) => {
    if (!file || !editing) return;
    if (!ALLOWED_BROCHURE_TYPES.includes(file.type)) {
      toast.error("Solo file PDF supportati per la brochure");
      return;
    }
    if (file.size > MAX_BROCHURE_MB * 1024 * 1024) {
      toast.error(`Brochure troppo grande (max ${MAX_BROCHURE_MB}MB)`);
      return;
    }
    setUploadingBrochure(true);
    const { url, error } = await uploadPdf(buildMediaPath("projects/brochures", file.name), file);
    if (error) {
      toast.error(`Upload brochure fallito: ${error}`);
      setUploadingBrochure(false);
      return;
    }
    setEditing({ ...editing, brochure_url: url ?? null });
    setUploadingBrochure(false);
  };

  const handleUploadVideo = async (file: File | null) => {
    if (!file || !editing) return;
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Formato video non supportato (mp4, webm, mov)");
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video troppo grande (max ${MAX_VIDEO_MB}MB)`);
      return;
    }
    setUploadingVideo(true);
    const { url, error } = await uploadVideo(buildMediaPath("projects", file.name), file);
    if (error) {
      toast.error(`Upload video fallito: ${error}`);
      setUploadingVideo(false);
      return;
    }
    setEditing({ ...editing, video_url: url ?? null });
    setUploadingVideo(false);
  };

  return { uploadingImages, uploadingVideo, uploadingBrochure, handleUploadImages, handleUploadBrochure, handleUploadVideo };
}
