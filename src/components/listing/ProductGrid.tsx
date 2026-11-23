"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { fetchListingPage, type ListingQuery } from "@/app/shop/actions";
import type { Product } from "@/lib/api/types";

interface ProductGridProps {
  initialItems: Product[];
  total: number;
  totalPages: number;
  query: ListingQuery;
}

export const GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

/** Product grid with a "Load more" button, like Zuricart's listings. */
export default function ProductGrid({
  initialItems,
  total,
  totalPages,
  query,
}: ProductGridProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(totalPages);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    setFailed(false);
    startTransition(async () => {
      try {
        const next = await fetchListingPage(query, page + 1);
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p._id));
          return [...prev, ...next.items.filter((p) => !seen.has(p._id))];
        });
        setPage(page + 1);
        setPages(next.meta.totalPages);
      } catch {
        setFailed(true);
      }
    });
  }

  const hasMore = page < pages;

  return (
    <div className="space-y-8">
      <div className={GRID_CLASS}>
        {items.map((product, i) => (
          <ProductCard key={product._id} product={product} priority={i < 5} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-gray-500">
          Showing {items.length} of {total}
        </p>
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-full bg-[#003B73] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002f5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73] focus-visible:ring-offset-2 disabled:opacity-70"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Loading…" : "Load more"}
          </button>
        ) : null}
        {failed ? (
          <p role="alert" className="text-sm text-red-600">
            Couldn&apos;t load more products. Please try again.
          </p>
        ) : null}
      </div>
    </div>
  );
}
