import ListingView from "@/components/listing/ListingView";
import { getNavCategories, type ProductsSort } from "@/lib/api";
import { Category } from "@/lib/api/types";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    price_min?: string;
    price_max?: string;
    sort?: string;
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
  const { q, price_min, price_max, sort } = await searchParams;

  let categories: Category[] = [];
  try {
    categories = await getNavCategories();
  } catch {
    categories = [];
  }

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
      query={{
        q,
        minPrice: toPrice(price_min),
        maxPrice: toPrice(price_max),
        sort: toSort(sort),
      }}
    />
  );
}
