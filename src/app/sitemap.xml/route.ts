import { getAllCategories, getProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import { buildSitemapXml, type SitemapEntry } from "@/lib/sitemap";

// Served as a route handler: the sitemap.ts metadata route returned 404 for
// /sitemap.xml on the Next 15 release candidate this app runs on.
export const revalidate = 3600;

async function getAllProductSlugs() {
  const slugs: Array<{ slug: string; updatedAt?: string }> = [];
  let page = 1;
  let totalPages = 1;

  do {
    const { items, meta } = await getProducts({
      page,
      limit: 100,
      sort: "updatedAt_desc",
    });
    for (const product of items) {
      if (product.slug) {
        slugs.push({ slug: product.slug, updatedAt: product.updatedAt });
      }
    }
    totalPages = meta?.totalPages || 1;
    page += 1;
  } while (page <= totalPages && page <= 100);

  return slugs;
}

export async function GET() {
  const now = new Date();
  const entries: SitemapEntry[] = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/offers"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const categories = await getAllCategories();
    for (const category of categories) {
      entries.push({
        url: absoluteUrl(`/collections/${category.slug}`),
        lastModified: category.updatedAt ? new Date(category.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // keep the static entries
  }

  try {
    for (const product of await getAllProductSlugs()) {
      entries.push({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // keep what we have
  }

  return new Response(buildSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
