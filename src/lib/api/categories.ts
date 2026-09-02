import { apiRequest, apiRequestPaginated } from "./client";
import { Category, CategoryQueryParams, PaginatedResult } from "./types";

export async function getCategories(
  params: CategoryQueryParams = {},
): Promise<PaginatedResult<Category>> {
  const { data, meta } = await apiRequestPaginated<Category[]>("/categories", {
    params: {
      q: params.q,
      sort: params.sort || "sortOrder_asc",
      page: params.page,
      limit: params.limit,
    },
    next: { revalidate: 300 },
  });

  return { items: data, meta };
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await apiRequest<Category>(`/categories/${slug}`, {
    next: { revalidate: 300 },
  });
  return data;
}

export async function getAllCategories(): Promise<Category[]> {
  const { items } = await getCategories({ limit: 100, page: 1 });
  return items;
}
