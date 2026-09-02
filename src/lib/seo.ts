import type { Metadata } from "next";
import type { Category, Product } from "@/lib/api/types";
import { getProductEffectivePrice, getProductImageUrl } from "@/lib/api/product-utils";

export const siteConfig = {
  name: "Yuricart",
  shortName: "Yuricart Kenya",
  description:
    "Shop electronics in Kenya — phones, laptops, printers, and accessories with fast delivery from Yuricart.",
  locale: "en_KE",
  twitterHandle: undefined as string | undefined,
};

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  return "https://www.yuricart.com";
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateMeta(text: string, max: number) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const sliced = cleaned.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

function stripHtml(value?: string) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function productSeoDefaults(product: Product) {
  const title = product.title?.trim() || "Product";
  const seoTitle = product.seoTitle?.trim() || truncateMeta(title, 60);
  const fromShort = product.shortDescription?.trim();
  const fromDesc = stripHtml(product.description);
  const metaDescription =
    product.metaDescription?.trim() ||
    truncateMeta(
      fromShort ||
        fromDesc ||
        `Buy ${title} online at Yuricart Kenya. Fast delivery across Nairobi and Kenya.`,
      160,
    );

  const primaryAlt =
    product.images?.primary?.alt?.trim() || title;

  return { seoTitle, metaDescription, primaryAlt };
}

export function categorySeoDefaults(category: Category) {
  const name = category.name?.trim() || "Category";
  const seoTitle = category.seoTitle?.trim() || truncateMeta(`${name} | Shop Online`, 60);
  const metaDescription =
    category.metaDescription?.trim() ||
    truncateMeta(
      category.description?.trim() ||
        `Shop ${name} at Yuricart Kenya. Browse deals with fast delivery.`,
      160,
    );
  const imageAlt =
    (typeof category.image === "object" && category.image?.alt?.trim()) || name;

  return { seoTitle, metaDescription, imageAlt };
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  noIndex = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || "/newlogoog.jpg";

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: ogImage,
          alt: imageAlt || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildProductJsonLd(product: Product) {
  const { metaDescription } = productSeoDefaults(product);
  const imageUrl = getProductImageUrl(product);
  const price = getProductEffectivePrice(product);
  const availability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const brandName =
    typeof product.brand === "object" && product.brand?.name
      ? product.brand.name
      : undefined;

  const categoryName =
    typeof product.category === "object" && product.category?.name
      ? product.category.name
      : undefined;

  // Product schema: name matches the on-page H1 (product.title).
  // Offer + Brand are required for rich results eligibility.
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: metaDescription,
    image: imageUrl ? [imageUrl] : undefined,
    sku: product.sku || undefined,
    brand: {
      "@type": "Brand",
      name: brandName || siteConfig.name,
    },
    category: categoryName || undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: product.currency || "KES",
      price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Homepage only — identifies the business and site search target */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/newlogoog.jpg"),
    description: siteConfig.description,
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Category listing page */
export function buildCollectionPageJsonLd(category: Category) {
  const { metaDescription } = categorySeoDefaults(category);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: metaDescription,
    url: absoluteUrl(`/collections/${category.slug}`),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };
}

/** Absolute title for SEO fields that already include the brand */
export function absoluteSeoTitle(seoTitle: string) {
  return {
    absolute: seoTitle.includes("Yuricart")
      ? seoTitle
      : `${seoTitle} | ${siteConfig.shortName}`,
  };
}
