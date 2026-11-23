import { apiRequest, apiRequestPaginated } from "./client";
import { Brand, BrandQueryParams, PaginatedResult } from "./types";

export async function getBrands(
  params: BrandQueryParams = {},
): Promise<PaginatedResult<Brand>> {
  const { data, meta } = await apiRequestPaginated<Brand[]>("/brands", {
    params: {
      q: params.q,
      sort: params.sort || "name_asc",
      page: params.page,
      limit: params.limit,
    },
    next: { revalidate: 300 },
  });

  return { items: data, meta };
}

export async function getBrandBySlug(slug: string): Promise<Brand> {
  const { data } = await apiRequest<Brand>(`/brands/${slug}`, {
    next: { revalidate: 300 },
  });
  return data;
}

export async function getAllBrands(): Promise<Brand[]> {
  const { items } = await getBrands({ limit: 100, page: 1 });
  return items;
}

/** False only for brands known to have no products (older APIs omit the count). */
export function brandHasProducts(brand: Brand): boolean {
  return brand.productCount === undefined || brand.productCount > 0;
}

/** Brands worth listing: those with at least one active product. */
export async function getNavBrands(): Promise<Brand[]> {
  return (await getAllBrands()).filter(brandHasProducts);
}

/** Logo or image URL for a brand, if it has one. */
export function getBrandLogoUrl(brand: Brand): string {
  if (typeof brand.image === "string" && brand.image) return brand.image;
  if (brand.image && typeof brand.image === "object" && brand.image.url) {
    return brand.image.url;
  }
  return brand.logo || "";
}
