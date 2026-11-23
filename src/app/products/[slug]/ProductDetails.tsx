"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Banknote,
  Check,
  Heart,
  Info,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import ProductOptions from "./ProductOptions";
import { checkInStock, cn, findVariant } from "@/lib/utils";
import ProductPrice from "./ProductPrice";
import ProductMedia from "./ProductMedia";
import AddToCartButton from "@/components/AddToCartButton";
import BackInStockNotificationButton from "@/components/BackInStockNotificationButton";
import BuyNowButton from "@/components/BuyNowButton";
import WhatsAppOrderButton from "@/components/ui/WhatsAppOrderButton";
import { LegacyProductDetail } from "@/lib/api/adapters";
import { Product } from "@/lib/api/types";
import { getProductEffectivePrice } from "@/lib/api/product-utils";
import { trackViewContent } from "@/lib/metaPixel";
import {
  useShippingRate,
  useWhatsAppNumber,
} from "@/components/WhatsAppSettingsProvider";
import { useToast } from "@/hooks/use-toast";
import { absoluteUrl } from "@/lib/seo";
import { formatKes } from "@/lib/product-specs";
import { scrollToSection } from "@/components/product/ProductSections";
import { BUY_BUTTON, CARD, PILL_BUTTON } from "@/components/product/styles";

interface ProductDetailsProps {
  product: LegacyProductDetail;
  apiProduct: Product;
  keySpecs: string[];
  warranty?: string;
  condition?: string;
}

const WISHLIST_KEY = "yuricart:wishlist";

function readWishlist(): string[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const TRUST_POINTS = [
  { icon: Truck, text: "Quick shipping across Kenya" },
  { icon: Store, text: "In-store pickup in Nairobi" },
  { icon: Banknote, text: "Payment on delivery accepted" },
  { icon: MessageCircle, text: "Order easily via WhatsApp" },
];

export default function ProductDetails({
  product,
  apiProduct,
  keySpecs,
  warranty,
  condition,
}: ProductDetailsProps) {
  const whatsappNumber = useWhatsAppNumber();
  const shippingRate = useShippingRate();
  const { toast } = useToast();
  const quantity = 1;
  const [location, setLocation] = useState("");
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    trackViewContent({
      content_ids: [apiProduct._id],
      content_name: apiProduct.title,
      content_type: "product",
      value: getProductEffectivePrice(apiProduct),
      currency: apiProduct.currency || "KES",
    });
  }, [apiProduct]);

  useEffect(() => {
    setWishlisted(readWishlist().includes(apiProduct.slug));
  }, [apiProduct.slug]);

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
  const isOutOfStock = maxQuantity === 0 || !inStock;
  // Products saved without a real price can't be ordered online (the server
  // refuses them too); offer a WhatsApp price enquiry instead.
  const priceUnavailable = !(getProductEffectivePrice(apiProduct) > 0);

  const selectedOptionsMedia = product.productOptions?.flatMap((option) => {
    const selectedChoice = option.choices?.find(
      (choice) => choice.description === selectedOptions[option.name || ""],
    );
    return selectedChoice?.media?.items ?? [];
  });

  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const productCode = apiProduct.sku || apiProduct._id.slice(-8).toUpperCase();
  const brandName = product.brand;

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API can be blocked (http pages, in-app browsers) — try the legacy path.
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(area);
      return copied;
    } catch {
      return false;
    }
  }

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: product.name ?? "", url: productUrl });
        return;
      } catch (error) {
        // The user closing the share sheet is not an error.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    if (await copyToClipboard(productUrl)) {
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard.",
      });
    } else {
      toast({
        title: "Copy this link to share",
        description: productUrl,
      });
    }
  }

  function handleWishlist() {
    const list = readWishlist();
    const next = list.includes(apiProduct.slug)
      ? list.filter((s) => s !== apiProduct.slug)
      : [...list, apiProduct.slug];
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable
    }
    setWishlisted(next.includes(apiProduct.slug));
    toast({
      title: next.includes(apiProduct.slug)
        ? "Added to wishlist"
        : "Removed from wishlist",
    });
  }

  function handleCompare() {
    if (!scrollToSection("compare")) {
      toast({ title: "No similar items to compare yet" });
    }
  }

  return (
    <div
      className={cn(
        CARD,
        "flex w-full flex-col p-4 md:flex-row md:gap-8 md:p-6",
      )}
    >
      {/* ---------- Left: gallery + share / compare / wishlist ---------- */}
      <div className="w-full md:w-[30%]">
        <ProductMedia
          media={
            !!selectedOptionsMedia?.length
              ? selectedOptionsMedia
              : product.media?.items
          }
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className={cn(PILL_BUTTON, "flex-1")}
          >
            <Share2 className="size-3.5" />
            Share
          </button>
          <button
            type="button"
            onClick={handleCompare}
            className={cn(PILL_BUTTON, "flex-1")}
          >
            <ArrowLeftRight className="size-3.5" />
            Compare
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            aria-pressed={wishlisted}
            className={cn(
              PILL_BUTTON,
              "flex-1",
              wishlisted && "border-red-200 bg-red-50 text-red-600",
            )}
          >
            <Heart
              className={cn("size-3.5", wishlisted && "fill-red-500 text-red-500")}
            />
            Wishlist
          </button>
        </div>
      </div>

      {/* ---------- Middle: title, price, key specs, delivery, warranty ---------- */}
      <div className="w-full pt-6 md:w-[45%] md:pt-0">
        {brandName && (
          <Link
            href={`/shop?q=${encodeURIComponent(brandName)}`}
            className="inline-flex items-center rounded-full bg-[#003B73]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#003B73] transition hover:bg-[#003B73]/10"
          >
            {brandName}
          </Link>
        )}
        <h1 className="mt-2 font-serif text-2xl font-bold leading-snug tracking-tight text-gray-900 md:text-[1.7rem]">
          {product.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              isOutOfStock
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                isOutOfStock ? "bg-red-500" : "bg-green-500",
              )}
            />
            {isOutOfStock ? "Out of Stock" : "In Stock"}
          </span>
          {!isOutOfStock && maxQuantity < 10 && (
            <span className="text-xs font-medium text-red-600">
              Only {maxQuantity} left
            </span>
          )}
          <span className="text-xs text-gray-500">
            Product code: <span className="font-medium text-gray-700">{productCode}</span>
          </span>
        </div>

        <ProductPrice product={product} selectedVariant={selectedVariant} />

        {!!product.productOptions?.length && (
          <div className="mb-4">
            <ProductOptions
              product={product}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
            />
          </div>
        )}

        {keySpecs.length > 0 && (
          <div className="rounded-xl bg-gray-50 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Key specifications
            </h2>
            <ul className="space-y-2 text-sm text-gray-800">
              {keySpecs.map((spec) => (
                <li key={spec} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#003B73]/10 text-[#003B73]">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delivery options */}
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 text-sm">
          <div className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2">
            <h2 className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-gray-500">
              Delivery options
            </h2>
            <label className="relative flex max-w-[12rem] flex-1 items-center">
              <MapPin
                className="pointer-events-none absolute left-2.5 size-3.5 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your location"
                aria-label="Delivery location"
                className="h-8 w-full rounded-full border border-gray-200 bg-white pl-8 pr-3 text-xs outline-none transition focus:border-[#003B73] focus:ring-2 focus:ring-[#003B73]/20"
              />
            </label>
          </div>
          <div className="flex items-center gap-3 p-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#003B73]/5 text-[#003B73]">
              <Truck className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col leading-snug">
              <strong className="text-gray-900">
                {shippingRate !== null
                  ? `Shipping ${formatKes(shippingRate)}`
                  : "Shipping calculated at checkout"}
              </strong>
              <span className="text-xs text-gray-500">
                Fast delivery across Nairobi &amp; Kenya
              </span>
            </div>
          </div>
        </div>

        {(warranty || condition) && (
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-orange-100/70">
            {warranty && (
              <div className="flex items-center gap-3 bg-orange-50 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#003B73] shadow-sm">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col leading-tight">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Warranty
                  </p>
                  <span className="mt-0.5 text-sm font-semibold text-gray-900">
                    {warranty}
                  </span>
                </div>
              </div>
            )}
            {condition && (
              <div className="flex flex-col justify-center bg-orange-50 p-3 leading-tight">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Condition
                </p>
                <span className="mt-0.5 text-sm font-semibold text-gray-900">
                  {condition}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Right: buy box ---------- */}
      <div className="w-full pb-28 md:w-[25%] md:pb-0">
        <div className="md:sticky md:top-40">
          {isOutOfStock ? (
            <BackInStockNotificationButton
              product={apiProduct}
              className="h-12 w-full rounded-xl bg-[#003B73] text-[15px] font-semibold hover:bg-[#002f5c]"
            />
          ) : priceUnavailable ? (
            <div className="fixed inset-x-0 bottom-[3.3rem] z-40 flex border-t border-gray-200 bg-white/95 p-2 shadow-[0_-8px_24px_-12px_rgba(16,24,40,0.25)] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
              <WhatsAppOrderButton
                phoneNumber={whatsappNumber}
                productName={product.name ?? "Unnamed Product"}
                productUrl={productUrl}
                quantity={quantity}
                salePrice={0}
                enquiry
                label="Ask for the price on WhatsApp"
                className="h-12 w-full rounded-xl bg-[#1fa855] text-[15px] font-semibold shadow-sm hover:bg-[#188f48]"
              />
            </div>
          ) : (
            <div className="fixed inset-x-0 bottom-[3.3rem] z-40 flex gap-2 border-t border-gray-200 bg-white/95 p-2 shadow-[0_-8px_24px_-12px_rgba(16,24,40,0.25)] backdrop-blur md:static md:flex-col md:gap-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
              <AddToCartButton
                product={apiProduct}
                selectedOptions={selectedOptions}
                quantity={quantity}
                className={cn(BUY_BUTTON, "bg-[#003B73] hover:bg-[#002f5c]")}
              />
              <BuyNowButton
                product={apiProduct}
                selectedOptions={selectedOptions}
                quantity={quantity}
                variant="default"
                className={cn(BUY_BUTTON, "bg-primary hover:bg-primary/90")}
              />
              <WhatsAppOrderButton
                phoneNumber={whatsappNumber}
                productName={product.name ?? "Unnamed Product"}
                productUrl={productUrl}
                quantity={quantity}
                salePrice={getProductEffectivePrice(apiProduct)}
                deliveryLocation={location}
                label="Buy on WhatsApp"
                className="hidden h-12 w-full rounded-xl bg-[#1fa855] text-[15px] font-semibold shadow-sm hover:bg-[#188f48] md:flex"
              />
            </div>
          )}

          <ul className="mt-5 space-y-3">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#003B73]/5 text-[#003B73]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <p className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              <strong>Kindly note:</strong> we keep products up to date, but
              price and availability can change without prior notice.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
