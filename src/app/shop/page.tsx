import ListingView from "@/components/listing/ListingView";
import { getNavBrands, getNavCategories, type ProductsSort } from "@/lib/api";
import { Brand, Category } from "@/lib/api/types";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    price_min?: string;
    price_max?: string;
    sort?: string;
    brand?: string;
    in_stock?: string;
  }>;
}

const SORTS: ProductsSort[] = [
  "createdAt_desc",
  "price_asc",
  "price_desc",
  "title_asc",
];

function toSort(sort?: string): ProductsSort | undefined {
  return SORTS.includes(sort as ProductsSort) ? (sort as ProductsSort) : undefined;
}

function toPrice(value?: string): number | undefined {
  const n = Number(value);
  return value && Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q, price_min, price_max, sort, brand, in_stock } = await searchParams;
  // Filtered and sorted views are duplicates of the main list: keep them out of search.
  const filtered = Boolean(price_min || price_max || sort || brand || in_stock);
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
    noIndex: filtered,
  });
}

export default async function Page({ searchParams }: PageProps) {
  const { q, price_min, price_max, sort, brand, in_stock } = await searchParams;

  let categories: Category[] = [];
  try {
    categories = await getNavCategories();
  } catch {
    categories = [];
  }

  const brands: Brand[] = await getNavBrands().catch(() => []);

  return (
    <ListingView
      title={q ? `Results for “${q}”` : "All products"}
      description={
        q
          ? undefined
          : "Phones, laptops, printers and accessories, with fast delivery across Nairobi and Kenya."
      }
      crumbs={[{ label: "Home", href: "/" }, { label: q ? "Search" : "Shop" }]}
      categories={categories}
      brands={brands}
      query={{
        q,
        brand: brand || undefined,
        inStock: in_stock === "1" || undefined,
        minPrice: toPrice(price_min),
        maxPrice: toPrice(price_max),
        sort: toSort(sort),
      }}
    />
  );
}
