import { apiRequest } from "./client";
import type { Product } from "./types";

export type ProductSuggestion = Pick<
  Product,
  "_id" | "title" | "slug" | "price" | "salePrice" | "stock" | "images" | "currency"
>;

/** A handful of products matching what the shopper has typed so far (word beginnings). */
export async function suggestProducts(q: string): Promise<ProductSuggestion[]> {
  const { data } = await apiRequest<ProductSuggestion[]>("/products/suggest", {
    params: { q },
  });
  return data;
}
