import { LegacyProductDetail } from "@/lib/api/adapters";

interface ProductPriceProps {
  product: LegacyProductDetail;
  selectedVariant: ReturnType<
    typeof import("@/lib/utils").findVariant
  > | null;
}

function toKes(formatted?: string) {
  // "KES 165,000.00" -> "Kes 165,000"
  if (!formatted) return formatted;
  const match = formatted.match(/^([A-Z]{3})\s?([\d,]+)(?:\.\d+)?$/);
  if (!match) return formatted;
  const code = match[1] === "KES" ? "Kes" : match[1];
  return `${code} ${match[2]}`;
}

export default function ProductPrice({
  product,
  selectedVariant,
}: ProductPriceProps) {
  const variantPriceData = (selectedVariant as { priceData?: LegacyProductDetail["priceData"] })?.priceData;
  const priceData = variantPriceData || product.priceData;

  if (!priceData) return null;

  const hasDiscount =
    priceData.formatted?.discountedPrice &&
    priceData.formatted.discountedPrice !== priceData.formatted.price;

  const discountValue =
    product.discount?.type === "PERCENT" ? product.discount.value : undefined;

  return (
    <div className="my-4 flex flex-wrap items-end gap-x-3 gap-y-1">
      <p className="text-3xl font-extrabold leading-none tracking-tight text-primary">
        {toKes(
          hasDiscount
            ? priceData.formatted?.discountedPrice
            : priceData.formatted?.price,
        )}
      </p>
      {hasDiscount && (
        <>
          <span className="pb-0.5 text-base text-gray-500 line-through">
            {toKes(priceData.formatted?.price)}
          </span>
          {discountValue ? (
            <span className="rounded-full bg-cta px-2.5 py-0.5 text-xs font-bold text-white">
              -{discountValue}%
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
