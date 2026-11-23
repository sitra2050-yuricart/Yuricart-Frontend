import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { formatKes } from "@/lib/product-specs";
import {
  getBrandName,
  getProductDiscountPercent,
  getProductEffectivePrice,
  getProductImageUrl,
  hasProductDiscount,
  isProductInStock,
  PRICE_ON_REQUEST,
} from "@/lib/api/product-utils";
import type { Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Load the image straight away (first row above the fold). */
  priority?: boolean;
}

/**
 * Listing card: image on a clean white square, name, bold price. Mirrors the
 * simple Zuricart card layout, in Yuricart's navy + orange styling.
 */
export default function ProductCard({ product, priority }: ProductCardProps) {
  const price = getProductEffectivePrice(product);
  const onSale = hasProductDiscount(product);
  const percent = getProductDiscountPercent(product);
  const inStock = isProductInStock(product);
  const brand = getBrandName(product.brand);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-14px_rgba(16,24,40,0.18)] transition duration-300 hover:-translate-y-0.5 hover:ring-[#003B73]/25 hover:shadow-[0_2px_4px_rgba(16,24,40,0.05),0_18px_36px_-16px_rgba(0,59,115,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <ProductImage
          src={getProductImageUrl(product, "")}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 220px"
          className={cn(
            "object-contain p-4 transition-transform duration-500 group-hover:scale-105",
            !inStock && "opacity-60",
          )}
        />
        {percent ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold leading-none text-white shadow-sm">
            -{percent}%
          </span>
        ) : null}
        {!inStock ? (
          <span className="absolute right-3 top-3 rounded-full bg-gray-900/85 px-2.5 py-1 text-[11px] font-semibold leading-none text-white">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-gray-100 px-3.5 pb-4 pt-3">
        {brand ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#003B73]/70">
            {brand}
          </span>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#003B73]">
          {product.title}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1.5">
          <span
            className={cn(
              "text-base font-bold",
              price > 0 ? "text-gray-900" : "text-sm text-gray-500",
            )}
          >
            {price > 0 ? formatKes(price) : PRICE_ON_REQUEST}
          </span>
          {onSale && price > 0 ? (
            <span className="text-xs text-gray-500 line-through">
              {formatKes(product.price)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
