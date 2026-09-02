import DiscountBadge from "@/components/DiscountBadge";
import { cn } from "@/lib/utils";
import { LegacyProductDetail } from "@/lib/api/adapters";

interface ProductPriceProps {
  product: LegacyProductDetail;
  selectedVariant: ReturnType<
    typeof import("@/lib/utils").findVariant
  > | null;
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

  return (
    <div className="flex items-center gap-2.5 text-xl font-bold">
      <span className={cn(hasDiscount && "text-muted-foreground line-through")}>
        {priceData.formatted?.price}
      </span>
      {hasDiscount && <span>{priceData.formatted?.discountedPrice}</span>}
      {product.discount && <DiscountBadge data={product.discount} />}
    </div>
  );
}
