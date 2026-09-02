
import Link from "next/link";
import ProductImage from "./ProductImage";
import DiscountBadge from "./DiscountBadge";
import { formatCurrency } from "@/lib/utils";
import Badge from "./ui/badge";
import { LegacyProductCard } from "@/lib/api/adapters";

interface ProductProps {
  product: LegacyProductCard;
}

export default function Product({ product }: ProductProps) {
  const mainImage = product.media?.mainMedia?.image;

  return (
    <Link href={`/products/${product.slug}`} className="h-full border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <ProductImage
          src={mainImage?.url}
          alt={mainImage?.altText}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2">
          {product.ribbon && <Badge>{product.ribbon}</Badge>}
          <Badge className="bg-secondary font-semibold text-secondary-foreground">
            {getFormattedPrice(product)}
          </Badge>
          {product.discount && <DiscountBadge data={product.discount} />}
        </div>
      </div>
      <div className="space-y-3 p-3">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <div
          className="line-clamp-5"
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        />
      </div>
    </Link>
  );
}

function getFormattedPrice(product: LegacyProductCard) {
  const minPrice = product.priceRange?.minValue;
  const maxPrice = product.priceRange?.maxValue;

  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `from ${formatCurrency(minPrice, product.priceData?.currency)}`;
  }

  return (
    product.priceData?.formatted?.discountedPrice ||
    product.priceData?.formatted?.price ||
    "n/a"
  );
}
