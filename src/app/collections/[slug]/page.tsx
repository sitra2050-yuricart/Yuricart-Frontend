import ListingView from "@/components/listing/ListingView";
import {
  getAllCategories,
  hasProducts,
  getCategoryBySlug,
  getCategoryImageUrl,
  type ProductsSort,
} from "@/lib/api";
import { Category } from "@/lib/api/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { orRedirectOnNotFound } from "@/lib/api/redirects";
import {
  absoluteSeoTitle,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildPageMetadata,
  categorySeoDefaults,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
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

function toPrice(value?: string): number | undefined {
  const n = Number(value);
  return value && Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await orRedirectOnNotFound(
    `/collections/${slug}`,
    () => getCategoryBySlug(slug),
  );
  if (!category?._id) notFound();

  const { seoTitle, metaDescription, imageAlt } = categorySeoDefaults(category);
  const imageUrl = getCategoryImageUrl(category.image);

  return {
    ...buildPageMetadata({
      title: seoTitle,
      description: metaDescription,
      path: `/collections/${category.slug}`,
      image: imageUrl || undefined,
      imageAlt,
      // An empty category should not be indexed as a thin page.
      noIndex: category.productCount === 0,
    }),
    title: absoluteSeoTitle(seoTitle),
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { price_min, price_max, sort } = await searchParams;
  const category = await orRedirectOnNotFound(
    `/collections/${slug}`,
    () => getCategoryBySlug(slug),
  );

  if (!category?._id) notFound();

  let categories: Category[] = [];
  try {
    categories = (await getAllCategories()).filter(
      (c) => hasProducts(c) || c.slug === category.slug,
    );
  } catch {
    categories = [];
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: category.name, path: `/collections/${category.slug}` },
  ]);

  return (
    <main className="mx-auto max-w-[88rem] px-5 py-6 sm:py-8">
      <JsonLd data={buildCollectionPageJsonLd(category)} />
      <JsonLd data={breadcrumbJsonLd} />
      <ListingView
        title={category.name}
        description={category.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
        categories={categories}
        activeCategory={category.slug}
        query={{
          category: category.slug,
          minPrice: toPrice(price_min),
          maxPrice: toPrice(price_max),
          sort: SORTS.includes(sort as ProductsSort)
            ? (sort as ProductsSort)
            : undefined,
        }}
      />
    </main>
  );
}
