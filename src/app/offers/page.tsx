import Link from "next/link";
import Breadcrumb from "@/components/listing/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/api";
import {
  getProductDiscountPercent,
  hasProductDiscount,
} from "@/lib/api/product-utils";
import type { Product } from "@/lib/api/types";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Offers and Discounts",
  description:
    "Discounted laptops, printers and accessories at Yuricart Kenya, sorted by the biggest saving.",
  path: "/offers",
});

/** Every discounted product, biggest saving first. */
async function getOffers(): Promise<Product[]> {
  const offers: Product[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const result = await getProducts({
        page,
        limit: 100,
        sort: "updatedAt_desc",
      });
      offers.push(...result.items.filter(hasProductDiscount));
      totalPages = result.meta.totalPages || 1;
      page += 1;
    } while (page <= totalPages && page <= 10);
  } catch {
    // show what we have
  }

  return offers.sort(
    (a, b) =>
      (getProductDiscountPercent(b) ?? 0) - (getProductDiscountPercent(a) ?? 0),
  );
}

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <main className="mx-auto max-w-[88rem] space-y-5 px-5 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Offers" }]} />

      <header className="rounded-2xl bg-white px-5 py-5 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:px-7">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Offers
          </h1>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
          Everything with a price drop, biggest saving first.
          {offers.length > 0 ? ` ${offers.length} products on offer.` : ""}
        </p>
      </header>

      {offers.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {offers.map((product, i) => (
            <ProductCard key={product._id} product={product} priority={i < 5} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-gray-900/5">
          <p className="text-lg font-bold text-gray-900">No offers right now</p>
          <p className="mt-1 text-sm text-gray-600">
            New deals land often. Browse everything in the meantime.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Shop all products
          </Link>
        </div>
      )}
    </main>
  );
}
