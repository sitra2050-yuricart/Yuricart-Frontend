"use server";

import {
  getProducts,
  getProductsByCategorySlug,
  type PaginatedResult,
  type Product,
  type ProductsSort,
} from "@/lib/api";

export interface ListingQuery {
  q?: string;
  /** Category slug; when set, the category endpoint is used. */
  category?: string;
  /** Brand slug. */
  brand?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductsSort;
}

const LISTING_PAGE_SIZE = 20;

export async function fetchListingPage(
  query: ListingQuery,
  page: number,
): Promise<PaginatedResult<Product>> {
  const { category, ...rest } = query;
  const params = { ...rest, page, limit: LISTING_PAGE_SIZE };
  return category
    ? getProductsByCategorySlug(category, params)
    : getProducts(params);
}
