import type { MetadataRoute } from "next";
import { getAllCategories, getProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/shop"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let categories: MetadataRoute.Sitemap = [];
  let products: MetadataRoute.Sitemap = [];

  try {
    const cats = await getAllCategories();
    categories = cats.map((category) => ({
      url: absoluteUrl(`/collections/${category.slug}`),
      lastModified: category.updatedAt
        ? new Date(category.updatedAt)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    categories = [];
  }

  try {
    const productSlugs = await getAllProductSlugs();
    products = productSlugs.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    products = [];
  }

  return [...staticRoutes, ...categories, ...products];
}
