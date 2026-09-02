/** Shared media limits — keep in sync with server/src/config/mediaLimits.js */

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
/** Product videos perform best at 30–60s. */
export const MAX_VIDEO_DURATION_SECONDS = 60;

/** Recommended product image canvas: 1080×1350 (4:5 portrait). */
export const PRODUCT_IMAGE_WIDTH = 1080;
export const PRODUCT_IMAGE_HEIGHT = 1350;
export const PRODUCT_IMAGE_RATIO = "4:5";
export const PRODUCT_IMAGE_RECOMMENDED_LABEL = "1080×1350 (4:5)";

export const ALLOWED_IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
export const ALLOWED_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10}MB`;
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration || 0);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata. Please try another file."));
    };

    video.src = url;
  });
}
