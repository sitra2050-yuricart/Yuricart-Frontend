import Image from "next/image";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  /** Direct image URL from custom backend */
  src?: string;
  /** Alias kept for gradual WixImage migration */
  mediaIdentifier?: string;
  placeholder?: string;
  alt?: string | null | undefined;
  width?: number;
  height?: number;
  className?: string;
  /** When true, image fills the relative parent (ignores width/height for layout) */
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
};

/**
 * Storefront product/category image — uses next/image + Cloudinary f_auto/q_auto/w_*.
 */
export default function ProductImage({
  src,
  mediaIdentifier,
  placeholder = "/placeholder.png",
  alt,
  width = 440,
  height = 550,
  className,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
}: ProductImageProps) {
  const rawUrl = src || mediaIdentifier || placeholder;
  const imageUrl = optimizeCloudinaryUrl(rawUrl, {
    width: fill ? 800 : width * 2,
    quality: "auto",
  });

  const resolvedSizes =
    sizes ||
    (fill
      ? "(max-width: 768px) 50vw, 220px"
      : `(max-width: 768px) 50vw, ${width}px`);

  if (fill) {
    return (
      <Image
        src={imageUrl || placeholder}
        alt={alt || ""}
        fill
        sizes={resolvedSizes}
        priority={priority}
        quality={quality}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={imageUrl || placeholder}
      alt={alt || ""}
      width={width}
      height={height}
      sizes={resolvedSizes}
      priority={priority}
      quality={quality}
      className={className}
    />
  );
}
