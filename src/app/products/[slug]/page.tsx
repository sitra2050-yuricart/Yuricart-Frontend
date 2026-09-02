import {
  getProductBySlug,
  getRelatedProducts,
  toLegacyProductCards,
  toLegacyProductDetail,
} from "@/lib/api";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { Suspense } from "react";
import Product from "@/components/Products";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductImageUrl } from "@/lib/api/product-utils";
import {
  absoluteSeoTitle,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildProductJsonLd,
  productSeoDefaults,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

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

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetails product={legacyProduct} apiProduct={apiProduct} />
      <hr />
      <Suspense fallback={<RelatedProductsLoadingSkeleton />}>
        <RelatedProducts slug={slug} />
      </Suspense>
    </main>
  );
}

async function RelatedProducts({ slug }: { slug: string }) {
  const relatedProducts = await getRelatedProducts(slug);
  if (!relatedProducts.length) return null;

  const legacyProducts = toLegacyProductCards(relatedProducts);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Related Products</h2>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid lg:grid-cols-4">
        {legacyProducts.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RelatedProductsLoadingSkeleton() {
  return (
    <div className="flex grid-cols-2 flex-col gap-5 pt-12 sm:grid lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[26rem] w-full" />
      ))}
    </div>
  );
}
