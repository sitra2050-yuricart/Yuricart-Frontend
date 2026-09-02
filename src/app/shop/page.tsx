import PaginationBar from "@/components/PaginationBar";
import Product from "@/components/Products";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProducts,
  toLegacyProductCards,
  ProductsSort,
} from "@/lib/api";
import { PaginatedResult, Product as ApiProduct } from "@/lib/api/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    collection?: string[];
    price_min?: string;
    price_max?: string;
    sort?: string;
  }>;
}

function mapSort(sort?: string): ProductsSort | undefined {
  if (!sort || sort === "last_updated") return "createdAt_desc";
  if (sort === "price_asc") return "price_asc";
  if (sort === "price_desc") return "price_desc";
  return sort as ProductsSort;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) {
    return buildPageMetadata({
      title: `Search results for "${q}"`,
      description: `Search results for ${q} at Yuricart Kenya.`,
      path: `/shop?q=${encodeURIComponent(q)}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: "Shop Electronics",
    description:
      "Browse phones, laptops, printers, and accessories at Yuricart Kenya. Fast delivery across Nairobi and Kenya.",
    path: "/shop",
  });
}

export default async function Page({ searchParams }: PageProps) {
  const {
    q,
    page = "1",
    collection: collectionSlugs,
    price_min,
    price_max,
    sort,
  } = await searchParams;
  const title = q ? `Results for "${q}"` : "Products";

  return (
    <div className="space-y-10">
      <h1 className="text-center text-3xl font-bold md:text-4xl">{title}</h1>
      <Suspense fallback={<LoadingSkeleton />} key={`${q}-${page}`}>
        <ProductResults
          q={q}
          page={parseInt(page)}
          categorySlugs={collectionSlugs}
          priceMin={price_min ? parseInt(price_min) : undefined}
          priceMax={price_max ? parseInt(price_max) : undefined}
          sort={mapSort(sort)}
        />
      </Suspense>
    </div>
  );
}

interface ProductResultsProps {
  q?: string;
  page: number;
  categorySlugs?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: ProductsSort;
}

async function ProductResults({
  q,
  page,
  categorySlugs,
  priceMin,
  priceMax,
  sort,
}: ProductResultsProps) {
  const pageSize = 8;

  let products: PaginatedResult<ApiProduct>;
  try {
    products = await getProducts({
      q,
      limit: pageSize,
      page,
      category: categorySlugs?.[0],
      minPrice: priceMin,
      maxPrice: priceMax,
      sort,
    });
  } catch {
    products = {
      items: [],
      meta: {
        page,
        limit: pageSize,
        total: 0,
        totalPages: 1,
      },
    };
  }

  if (page > products.meta.totalPages) notFound();

  const legacyProducts = toLegacyProductCards(products.items);

  return (
    <div className="space-y-10 group-has-[[data-pending]]:animate-pulse">
      <p className="text-center text-xl">
        {products.meta.total}{" "}
        {products.meta.total === 1 ? "product" : "products"} found
      </p>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {legacyProducts.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar
        currentPage={page}
        totalPages={products.meta.totalPages}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="mx-auto h-9 w-52" />
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[26rem]" />
        ))}
      </div>
    </div>
  );
}
