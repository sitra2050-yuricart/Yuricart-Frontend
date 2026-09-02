"use client";

import dynamic from "next/dynamic";
import { Product } from "@/lib/api/types";
import { HomepageBannerGrid } from "@/lib/api/homepage";

const ProductCarouselLazy = dynamic(() => import("./ProductCarousel"), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-[#e8eef5]" />
      <div className="h-[22rem] animate-pulse rounded-xl bg-[#e8eef5]" />
    </div>
  ),
});

const BannerGridLazy = dynamic(() => import("./BannerGrid"), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-[#e8eef5]" />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/2] animate-pulse rounded-xl bg-[#e8eef5]"
          />
        ))}
      </div>
    </div>
  ),
});

export function DeferredProductCarousel({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  return <ProductCarouselLazy title={title} products={products} />;
}

export function DeferredBannerGrid({
  title,
  banners,
}: {
  title: string;
  banners: HomepageBannerGrid;
}) {
  return <BannerGridLazy title={title} banners={banners} />;
}
