import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

export const twConfig = resolveConfig(tailwindConfig);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCurrency(
  price: number | string = 0,
  currency: string = "KES",
) {
  return Intl.NumberFormat("en", { style: "currency", currency }).format(
    Number(price),
  );
}

export const InventoryStatus = {
  IN_STOCK: "IN_STOCK",
  PARTIALLY_OUT_OF_STOCK: "PARTIALLY_OUT_OF_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export interface VariantProductShape {
  manageVariants?: boolean;
  variants?: Array<{
    choices?: Record<string, string>;
    stock?: { quantity?: number; inStock?: boolean };
  }>;
  stock?: { quantity?: number; inventoryStatus?: string };
}

export function findVariant(
  product: VariantProductShape,
  selectedOptions: Record<string, string>,
) {
  if (!product.manageVariants) return null;

  return (
    product.variants?.find((variant) => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => variant.choices?.[key] === value,
      );
    }) || null
  );
}

export function checkInStock(
  product: VariantProductShape,
  selectedOptions: Record<string, string>,
) {
  const variant = findVariant(product, selectedOptions);

  return variant
    ? variant.stock?.quantity !== 0 && variant.stock?.inStock
    : product.stock?.inventoryStatus === InventoryStatus.IN_STOCK ||
        product.stock?.inventoryStatus ===
          InventoryStatus.PARTIALLY_OUT_OF_STOCK;
}
