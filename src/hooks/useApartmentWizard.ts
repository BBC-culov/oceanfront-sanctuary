import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { BUCKETS, buildMediaPath, removeByPublicUrl, uploadImage, uploadVideo } from "@/lib/mediaStorage";
import { STEPS, validateStep, type ApartmentForm, type ValidationErrors } from "@/components/admin/apartment-wizard/types";

interface UseApartmentWizardArgs {
  initialData: ApartmentForm;
  initialServices: string;
  initialImages: string[];
  initialVideos: string[];
  editId?: string;
  onSave: (form: ApartmentForm, servicesInput: string, images: string[], videos: string[]) => void;
}

/**
 * Wizard behaviour: step navigation with validation, media uploads/removals
 * (via the shared storage helpers) and the final save.
 */
export function useApartmentWizard({
  initialData,
  initialServices,
  initialImages,
  initialVideos,
  editId,
  onSave,
}: UseApartmentWizardArgs) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [form, setForm] = useState<ApartmentForm>(initialData);
  const [servicesInput, setServicesInput] = useState(initialServices);
  const [images, setImages] = useState<string[]>(initialImages);
  const [videos, setVideos] = useState<string[]>(initialVideos);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const progress = ((step + 1) / STEPS.length) * 100;
  const isLastStep = step === STEPS.length - 1;

  const goNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    setErrors({});
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const goToStep = (i: number) => {
    if (i > step) {
      const stepErrors = validateStep(step, form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    setErrors({});
    setDirection(i > step ? 1 : -1);
    setStep(i);
  };

  const handleSave = () => {
    for (let s = 0; s < STEPS.length; s++) {
      const stepErrors = validateStep(s, form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setDirection(s > step ? 1 : -1);
        setStep(s);
        toast({ title: "Correggi gli errori", description: "Alcuni campi non sono validi", variant: "destructive" });
        return;
      }
    }
    onSave(form, servicesInput, images, videos);
  };

  const uploadMedia = async (
    files: FileList,
    uploader: typeof uploadImage | typeof uploadVideo,
    errorTitle: string
  ) => {
    const folder = editId || form.slug || `new-${Date.now()}`;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const { url, error } = await uploader(buildMediaPath(folder, file.name), file);
      if (error) {
        toast({ title: errorTitle, description: error, variant: "destructive" });
        continue;
      }
      if (url) urls.push(url);
    }
    return urls;
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls = await uploadMedia(files, uploadImage, "Errore upload");
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingVideo(true);
    const newUrls = await uploadMedia(files, uploadVideo, "Errore upload video");
    setVideos((prev) => [...prev, ...newUrls]);
    setUploadingVideo(false);
  };

  const removeImage = async (url: string) => {
    await removeByPublicUrl(BUCKETS.images, url);
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const removeVideo = async (url: string) => {
    await removeByPublicUrl(BUCKETS.videos, url);
    setVideos((prev) => prev.filter((u) => u !== url));
  };

  return {
    step, direction, progress, isLastStep,
    form, setForm,
    servicesInput, setServicesInput,
    images, setImages, videos,
    uploading, uploadingVideo,
    errors,
    goNext, goPrev, goToStep, handleSave,
    handleUpload, handleVideoUpload, removeImage, removeVideo,
  };
}
