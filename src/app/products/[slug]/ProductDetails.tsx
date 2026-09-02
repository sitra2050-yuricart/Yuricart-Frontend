"use client";

import Badge from "@/components/ui/badge";
import { useState, useCallback, useEffect } from "react";
import ProductOptions from "./ProductOptions";
import { checkInStock, findVariant } from "@/lib/utils";
import ProductPrice from "./ProductPrice";
import ProductMedia from "./ProductMedia";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import AddToCartButton from "@/components/AddToCartButton";
import BackInStockNotificationButton from "@/components/BackInStockNotificationButton";
import BuyNowButton from "@/components/BuyNowButton";
import WhatsAppOrderButton from "@/components/ui/WhatsAppOrderButton";
import { LegacyProductDetail } from "@/lib/api/adapters";
import { Product } from "@/lib/api/types";
import { getProductEffectivePrice } from "@/lib/api/product-utils";
import { trackViewContent } from "@/lib/metaPixel";

interface ProductDetailsProps {
  product: LegacyProductDetail;
  apiProduct: Product;
}

export default function ProductDetails({
  product,
  apiProduct,
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    trackViewContent({
      content_ids: [apiProduct._id],
      content_name: apiProduct.title,
      content_type: "product",
      value: getProductEffectivePrice(apiProduct),
      currency: apiProduct.currency || "KES",
    });
  }, [apiProduct]);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(
    product.productOptions
      ?.map((option) => ({
        [option.name || ""]: option.choices?.[0].description || "",
      }))
      ?.reduce((acc, curr) => ({ ...acc, ...curr }), {}) || {},
  );

  const selectedVariant = findVariant(product, selectedOptions);

  const inStock = checkInStock(product, selectedOptions);

  const availableQuantity =
    selectedVariant?.stock?.quantity ?? product.stock?.quantity ?? 0;

  const maxQuantity = Math.max(0, availableQuantity);
  const isOutOfStock = maxQuantity === 0;

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (isNaN(val)) return;
      if (val < 1) {
        setQuantity(1);
      } else if (maxQuantity > 0 && val > maxQuantity) {
        setQuantity(maxQuantity);
      } else {
        setQuantity(val);
      }
    },
    [maxQuantity],
  );

  const selectedOptionsMedia = product.productOptions?.flatMap((option) => {
    const selectedChoice = option.choices?.find(
      (choice) => choice.description === selectedOptions[option.name || ""],
    );
    return selectedChoice?.media?.items ?? [];
  });

  return (
    <div className="flex flex-col gap-10 md:flex-row lg:gap-20">
      <ProductMedia
        media={
          !!selectedOptionsMedia?.length
            ? selectedOptionsMedia
            : product.media?.items
        }
      />

      <div className="basis-3/5 space-y-5">
        <div className="space-y-2.5">
          <h1 className="text-3xl font-bold lg:text-4xl">{product.name}</h1>
          {product.brand && (
            <div className="text-muted-foreground">{product.brand}</div>
          )}
          {product.ribbon && <Badge className="block">{product.ribbon}</Badge>}
        </div>
        {product.description && (
          <div
            dangerouslySetInnerHTML={{ __html: product.description }}
            className="prose dark:prose-invert whitespace-pre-wrap"
          />
        )}

        <ProductPrice product={product} selectedVariant={selectedVariant} />

        <ProductOptions
          product={product}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />

        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center gap-2.5">
            <Input
              name="quantity"
              type="number"
              min={1}
              max={maxQuantity || 1}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-24"
              disabled={isOutOfStock}
            />
            {isOutOfStock && (
              <span className="font-semibold text-destructive">Out of Stock</span>
            )}
            {!isOutOfStock && maxQuantity < 10 && (
              <span className="text-destructive">
                Only {maxQuantity} left in stock
              </span>
            )}
          </div>
        </div>

        {!isOutOfStock ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <AddToCartButton
                product={apiProduct}
                selectedOptions={selectedOptions}
                quantity={quantity}
                disabled={quantity < 1 || quantity > maxQuantity}
                className="w-full"
              />
              <BuyNowButton
                product={apiProduct}
                selectedOptions={selectedOptions}
                quantity={quantity}
                disabled={quantity < 1 || quantity > maxQuantity}
              />
            </div>

            <div className="whitespace-nowrap">
              <WhatsAppOrderButton
                phoneNumber="+254768054542"
                productName={product.name ?? "Unnamed Product"}
                productUrl={`https://www.yuricart.com/products/${product.slug}`}
                quantity={quantity}
                salePrice={
                  (selectedVariant as { priceData?: { discountedPrice?: number; price?: number } })?.priceData?.discountedPrice ??
                  (product as { priceData?: { discountedPrice?: number; price?: number } })?.priceData?.discountedPrice ??
                  (selectedVariant as { priceData?: { price?: number } })?.priceData?.price ??
                  (product as { priceData?: { price?: number } })?.priceData?.price ??
                  0
                }
              />
            </div>
          </div>
        ) : (
          <BackInStockNotificationButton product={apiProduct} className="w-full" />
        )}
      </div>
    </div>
  );
}
