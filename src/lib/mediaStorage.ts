// Centralized access to Cloud storage buckets for apartment/project media.
// Keeps bucket names, path sanitization and public-URL logic in one place.

import { supabase } from "@/integrations/supabase/client";

export const BUCKETS = {
  images: "apartment-images",
  videos: "apartment-videos",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export function getPublicUrl(bucket: BucketName, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Random, filesystem-safe file name inside a folder. */
export function buildMediaPath(folder: string, fileName: string): string {
  const uid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${folder}/${uid}-${safeName}`;
}

interface UploadResult {
  url?: string;
  error?: string;
}

async function upload(
  bucket: BucketName,
  path: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string }
): Promise<UploadResult> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: options?.upsert ?? true,
    ...(options?.contentType ? { contentType: options.contentType } : {}),
  });
  if (error) return { error: error.message };
  return { url: getPublicUrl(bucket, path) };
}

export function uploadImage(path: string, file: File, options?: { upsert?: boolean; contentType?: string }) {
  return upload(BUCKETS.images, path, file, options);
}

export function uploadVideo(path: string, file: File, options?: { upsert?: boolean }) {
  return upload(BUCKETS.videos, path, file, options);
}

export function uploadPdf(path: string, file: File) {
  return upload(BUCKETS.images, path, file, { upsert: true, contentType: "application/pdf" });
}

/**
 * Extracts a safe storage path from a public URL for the given bucket.
 * Rejects traversal, absolute paths, null bytes, backslashes and any
 * character outside our conservative whitelist, so a tampered URL can
 * never be used to delete files outside the intended folder.
 */
export function extractStoragePath(url: string, bucket: BucketName): string | null {
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  try {
    const decoded = decodeURIComponent(url.slice(idx + marker.length));
    if (
      decoded.startsWith("/") ||
      decoded.includes("..") ||
      decoded.includes("\0") ||
      decoded.includes("\\") ||
      !/^[A-Za-z0-9._\-/]+$/.test(decoded)
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/** Removes files by storage path. Returns an error message when it fails. */
export async function removeFiles(bucket: BucketName, paths: string[]): Promise<string | null> {
  if (paths.length === 0) return null;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  return error ? error.message : null;
}

/** Best-effort removal of a single public URL. Silently ignores unsafe URLs. */
export async function removeByPublicUrl(bucket: BucketName, url: string): Promise<void> {
  const path = extractStoragePath(url, bucket);
  if (path) await removeFiles(bucket, [path]);
}
