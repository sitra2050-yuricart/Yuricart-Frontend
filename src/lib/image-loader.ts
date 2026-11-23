/**
 * next/image loader that skips Vercel's image optimizer.
 *
 * Cloudinary already resizes and compresses (f_auto, q_auto), so we ask it for
 * the width next/image wants instead of paying for a second optimization pass.
 * That pass hit the plan's quota and every uncached image started returning
 * 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED. Other URLs are passed through.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }

  const w = Math.round(width);
  const marker = "/upload/";
  const i = src.indexOf(marker) + marker.length;
  const rest = src.slice(i);
  const firstSegment = rest.split("/")[0];
  const transformed = /(^|,)(f_|w_|q_|c_)/.test(firstSegment);

  if (!transformed) {
    return `${src.slice(0, i)}f_auto,q_auto,c_limit,w_${w}/${rest}`;
  }

  const parts = firstSegment.split(",").filter((p) => !p.startsWith("w_"));
  for (const must of ["f_auto", "q_auto", "c_limit"]) {
    const key = must.slice(0, 2);
    if (!parts.some((p) => p.startsWith(key))) parts.push(must);
  }
  parts.push(`w_${w}`);
  return `${src.slice(0, i)}${parts.join(",")}/${rest.slice(firstSegment.length + 1)}`;
}
