import { Product, StorefrontProductImage, StorefrontImageData } from "./types";

function normalizeImages(product: Product): {
  primary: StorefrontImageData;
  gallery: StorefrontImageData[];
} {
  const imgs = product.images as unknown;
  if (!imgs) {
    return { primary: { url: "" }, gallery: [] };
  }

  // New format { primary: { url, publicId }, gallery: [...] }
  if (imgs && typeof imgs === "object" && "primary" in (imgs as any)) {
    const obj = imgs as { primary?: StorefrontImageData; gallery?: StorefrontImageData[] };
    return {
      primary: obj.primary || { url: "" },
      gallery: obj.gallery || [],
    };
  }

  // Legacy array format [{ url, alt, publicId, isPrimary }]
  if (Array.isArray(imgs)) {
    const arr = imgs as StorefrontProductImage[];
    const primary = arr.find((img) => img.isPrimary) || arr[0];
    const gallery = arr.filter((img) => img !== primary && img !== arr[0]);
    return {
      primary: {
        url: primary?.url || "",
        publicId: primary?.publicId,
        alt: primary?.alt,
      },
      gallery: gallery.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt,
      })),
    };
  }

  return { primary: { url: "" }, gallery: [] };
}

export function getProductPrimaryImage(product: Product): StorefrontImageData | undefined {
  const { primary } = normalizeImages(product);
  return primary?.url ? primary : undefined;
}

export function getProductImageUrl(
  product: Product,
  placeholder = "/placeholder.png",
): string {
  const { primary } = normalizeImages(product);
  return primary?.url || placeholder;
}

export function getProductGallery(product: Product): StorefrontImageData[] {
  const { gallery } = normalizeImages(product);
  return gallery;
}

export function getProductVideo(product: Product) {
  return product.video?.url ? product.video : undefined;
}

export function getProductEffectivePrice(product: Product): number {
  if (product.salePrice != null && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product.price;
}

export function hasProductDiscount(product: Product): boolean {
  return (
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price
  );
}

export function getProductDiscountPercent(product: Product): number | null {
  if (!hasProductDiscount(product) || !product.salePrice) return null;
  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}

export function isProductInStock(product: Product): boolean {
  return product.stock > 0;
}

export function getCategoryName(category: Product["category"]): string | undefined {
  if (!category) return undefined;
  return typeof category === "string" ? undefined : category.name;
}

export function getCategoryImageUrl(
  image?: string | StorefrontImageData | null,
): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.url || "";
}

export function getBrandName(brand: Product["brand"]): string | undefined {
  if (!brand) return undefined;
  return typeof brand === "string" ? undefined : brand.name;
}
