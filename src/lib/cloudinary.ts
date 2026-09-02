/**
 * Inject Cloudinary delivery transforms so cards don't download full-resolution JPGs.
 * No-op for non-Cloudinary URLs.
 */
export function optimizeCloudinaryUrl(
  url: string | undefined | null,
  options: { width?: number; height?: number; quality?: string | number } = {},
): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // Already transformed (has f_ or w_ / q_ after /upload/)
  if (/\/upload\/[^/]*?(f_|w_|q_|c_)/.test(url)) {
    return url;
  }

  const { width = 800, height, quality = "auto" } = options;
  const parts = [`f_auto`, `q_${quality}`, `c_limit`, `w_${Math.round(width)}`];
  if (height) parts.push(`h_${Math.round(height)}`);

  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}
