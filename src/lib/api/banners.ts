import { apiRequest, apiRequestPaginated } from "./client";
import { Banner, BannerQueryParams, PaginatedResult } from "./types";

export async function getBanners(
  params: BannerQueryParams = {},
): Promise<PaginatedResult<Banner>> {
  const { data, meta } = await apiRequestPaginated<Banner[]>("/banners", {
    params: {
      placement: params.placement,
      sort: params.sort || "sortOrder_asc",
      page: params.page,
      limit: params.limit,
    },
    next: { revalidate: 300 },
  });

  return { items: data, meta };
}

export async function getBannerBySlug(slug: string): Promise<Banner> {
  const { data } = await apiRequest<Banner>(`/banners/${slug}`, {
    next: { revalidate: 300 },
  });
  return data;
}

export async function getHeroBanners(): Promise<Banner[]> {
  const { items } = await getBanners({
    placement: "hero",
    limit: 20,
    page: 1,
  });
  return items;
}

export async function getPromoBanners(): Promise<Banner[]> {
  const { items } = await getBanners({
    placement: "promo",
    limit: 20,
    page: 1,
  });
  return items;
}
