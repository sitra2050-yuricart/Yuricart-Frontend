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
