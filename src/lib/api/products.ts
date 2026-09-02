import { apiRequest, apiRequestPaginated } from "./client";
import { PaginatedResult, Product, ProductQueryParams } from "./types";

function toQueryParams(params: ProductQueryParams = {}) {
  return {
    q: params.q,
    category: params.category,
    brand: params.brand,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
    featured: params.featured,
    newArrival: params.newArrival,
    bestSeller: params.bestSeller,
    tags: params.tags,
    page: params.page,
    limit: params.limit,
  };
}

export async function getProducts(
  params: ProductQueryParams = {},
): Promise<PaginatedResult<Product>> {
  const { data, meta } = await apiRequestPaginated<Product[]>("/products", {
    params: toQueryParams(params),
    next: { revalidate: 60 },
  });

  return { items: data, meta };
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await apiRequest<Product>(`/products/${slug}`, {
    next: { revalidate: 60 },
  });
  return data;
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const { data } = await apiRequest<Product[]>(`/products/${slug}/related`, {
    next: { revalidate: 60 },
  });
  return data;
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  params: ProductQueryParams = {},
): Promise<PaginatedResult<Product>> {
  const { data, meta } = await apiRequestPaginated<Product[]>(
    `/categories/${categorySlug}/products`,
    {
      params: toQueryParams(params),
      next: { revalidate: 60 },
    },
  );

  return { items: data, meta };
}

export async function searchProducts(
  q: string,
  params: Omit<ProductQueryParams, "q"> = {},
): Promise<PaginatedResult<Product>> {
  return getProducts({ ...params, q });
}

export async function getFeaturedProducts(
  params: Omit<ProductQueryParams, "featured"> = {},
): Promise<PaginatedResult<Product>> {
  return getProducts({ ...params, featured: true });
}

export async function getNewArrivalProducts(
  params: Omit<ProductQueryParams, "newArrival"> = {},
): Promise<PaginatedResult<Product>> {
  return getProducts({ ...params, newArrival: true });
}

export async function getBestSellerProducts(
  params: Omit<ProductQueryParams, "bestSeller"> = {},
): Promise<PaginatedResult<Product>> {
  return getProducts({ ...params, bestSeller: true });
}
