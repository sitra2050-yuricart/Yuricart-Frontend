import Link from "next/link";
import { Suspense } from "react";
import Breadcrumb, { type Crumb } from "./Breadcrumb";
import CategoryStrip from "./CategoryStrip";
import ListingToolbar from "./ListingToolbar";
import ProductGrid, { GRID_CLASS } from "./ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchListingPage, type ListingQuery } from "@/app/shop/actions";
import type { Category, PaginatedResult, Product } from "@/lib/api/types";

interface ListingViewProps {
  title: string;
  description?: string;
  crumbs: Crumb[];
  categories: Category[];
  activeCategory?: string;
  query: ListingQuery;
}

/** Shared layout for /shop (and search) and /collections/[slug]. */
export default function ListingView({
  title,
  description,
  crumbs,
  categories,
  activeCategory,
  query,
}: ListingViewProps) {
  return (
    <div className="space-y-5">
      <Breadcrumb items={crumbs} />

      <header className="rounded-2xl bg-white px-5 py-5 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:px-7">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        ) : null}
      </header>

      <CategoryStrip categories={categories} activeSlug={activeCategory} />

      <Suspense fallback={<ListingSkeleton />} key={JSON.stringify(query)}>
        <Results query={query} />
      </Suspense>
    </div>
  );
}

async function Results({ query }: { query: ListingQuery }) {
  let result: PaginatedResult<Product>;
  try {
    result = await fetchListingPage(query, 1);
  } catch {
    result = {
      items: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  }

  const hasFilters = Boolean(
    query.q || query.minPrice !== undefined || query.maxPrice !== undefined,
  );

  return (
    <div className="space-y-5">
      {result.items.length || hasFilters ? (
        <ListingToolbar total={result.meta.total} />
      ) : null}
      {result.items.length ? (
        <ProductGrid
          initialItems={result.items}
          total={result.meta.total}
          totalPages={result.meta.totalPages}
          query={query}
        />
      ) : (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-gray-900/5">
          <p className="text-lg font-bold text-gray-900">
            {hasFilters ? "No products found" : "Nothing here yet"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {hasFilters
              ? "Try a different search or price range."
              : "We have no products in this category right now."}
          </p>
          {!hasFilters ? (
            <Link
              href="/shop"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Browse all products
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-2xl sm:h-[4.25rem]" />
      <div className={GRID_CLASS}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[19rem] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
