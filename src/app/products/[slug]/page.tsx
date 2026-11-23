import {
  getProductBySlug,
  getRelatedProducts,
  toLegacyProductDetail,
} from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { getProductImageUrl } from "@/lib/api/product-utils";
import {
  absoluteSeoTitle,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildProductJsonLd,
  productSeoDefaults,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
  CompareTable,
  Expandable,
  ProductRail,
  RecentlyViewed,
  Section,
  SectionTabs,
  SpecsTable,
} from "@/components/product/ProductSections";
import {
  findSpec,
  getKeySpecs,
  hasHtml,
  parseSpecs,
  toCompareItem,
  toRailItem,
} from "@/lib/product-specs";
import type { Product } from "@/lib/api/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product?._id) notFound();

  const { seoTitle, metaDescription, primaryAlt } = productSeoDefaults(product);
  const imageUrl = getProductImageUrl(product);

  return {
    ...buildPageMetadata({
      title: seoTitle,
      description: metaDescription,
      path: `/products/${product.slug}`,
      image: imageUrl,
      imageAlt: primaryAlt,
    }),
    title: absoluteSeoTitle(seoTitle),
  };
}

async function loadRelated(slug: string): Promise<Product[]> {
  try {
    return await getRelatedProducts(slug);
  } catch {
    return [];
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const apiProduct = await getProductBySlug(slug);

  if (!apiProduct?._id) notFound();

  const legacyProduct = toLegacyProductDetail(apiProduct);
  const categoryName =
    typeof apiProduct.category === "object" && apiProduct.category?.name
      ? apiProduct.category.name
      : undefined;
  const categorySlug =
    typeof apiProduct.category === "object" && apiProduct.category?.slug
      ? apiProduct.category.slug
      : undefined;

  const productJsonLd = buildProductJsonLd(apiProduct);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    ...(categoryName && categorySlug
      ? [{ name: categoryName, path: `/collections/${categorySlug}` }]
      : [{ name: "Shop", path: "/shop" }]),
    { name: apiProduct.title, path: `/products/${apiProduct.slug}` },
  ]);

  const related = await loadRelated(slug);
  const specs = parseSpecs(apiProduct.description);
  const keySpecs = getKeySpecs(apiProduct.shortDescription, specs);
  const warranty = findSpec(specs, /warrant/i);
  const condition = findSpec(specs, /^condition$/i);
  const description = apiProduct.description?.trim();
  const videoUrl = apiProduct.video?.url;

  const relatedItems = related.map(toRailItem);
  const compareItems = [apiProduct, ...related.slice(0, 3)].map(toCompareItem);
  const hasCompare =
    compareItems.length > 1 &&
    compareItems.some((item) => Object.keys(item.specs).length > 0);

  const tabs = [
    ...(description ? [{ id: "overview", label: "Overview" }] : []),
    ...(specs.length ? [{ id: "specs", label: "Detailed Specs" }] : []),
    ...(videoUrl ? [{ id: "videos", label: "Videos" }] : []),
    ...(relatedItems.length
      ? [{ id: "related", label: "Related Products" }]
      : []),
    ...(hasCompare ? [{ id: "compare", label: "Compare" }] : []),
    { id: "recently-viewed", label: "Recently Viewed" },
  ];

  return (
    <main className="bg-[#f6f7f9] pb-6">
      <div className="mx-auto max-w-[1280px] px-2 py-4 md:px-4 md:py-6">
        <JsonLd data={productJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />

        <nav aria-label="Breadcrumb" className="mb-4 hidden lg:block">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500">
            <li>
              <Link href="/" className="transition-colors hover:text-[#003B73]">
                Home
              </Link>
            </li>
            <ChevronRight className="size-3.5 text-gray-300" aria-hidden="true" />
            <li>
              <Link
                href={categorySlug ? `/collections/${categorySlug}` : "/shop"}
                className="transition-colors hover:text-[#003B73]"
              >
                {categoryName ?? "Shop"}
              </Link>
            </li>
            <ChevronRight className="size-3.5 text-gray-300" aria-hidden="true" />
            <li
              className="max-w-md truncate font-medium text-gray-800"
              aria-current="page"
            >
              {apiProduct.title}
            </li>
          </ol>
        </nav>

        <ProductDetails
          product={legacyProduct}
          apiProduct={apiProduct}
          keySpecs={keySpecs}
          warranty={warranty}
          condition={condition}
        />

        <SectionTabs tabs={tabs} />

        {description && (
          <Section id="overview" title="Overview">
            <Expandable>
              {hasHtml(description) ? (
                <div
                  className="prose prose-gray max-w-none px-4 py-5 text-gray-700 md:px-6 prose-headings:font-serif prose-headings:text-gray-900 prose-a:text-[#003B73] prose-li:my-0.5"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <div className="whitespace-pre-line px-4 py-5 leading-relaxed text-gray-700 md:px-6">
                  {description}
                </div>
              )}
            </Expandable>
          </Section>
        )}

        {specs.length > 0 && (
          <Section id="specs" title="Specifications">
            <Expandable>
              <SpecsTable rows={specs} />
            </Expandable>
          </Section>
        )}

        {videoUrl && (
          <Section id="videos" title="Videos">
            <div className="p-4 md:p-6">
              <video
                controls
                playsInline
                preload="metadata"
                poster={apiProduct.video?.thumbnailUrl}
                className="mx-auto max-h-[28rem] w-full max-w-3xl rounded-xl bg-black"
              >
                <source
                  src={videoUrl}
                  type={`video/${apiProduct.video?.format || "mp4"}`}
                />
              </video>
            </div>
          </Section>
        )}

        <ProductRail id="related" title="Related Products" items={relatedItems} />

        {hasCompare && <CompareTable items={compareItems} />}

        <RecentlyViewed current={toRailItem(apiProduct)} />
      </div>
    </main>
  );
}
