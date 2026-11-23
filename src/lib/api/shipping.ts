import { apiRequest } from "./client";

export interface ShippingQuote {
  shipping: number;
  /** Subtotal at which delivery becomes free, when the zone has one. */
  freeAbove: number | null;
  zone: string | null;
}

/** Delivery fee for a subtotal and place. Same rules the order uses. */
export async function quoteShipping(subtotal: number, region: string): Promise<ShippingQuote> {
  const { data } = await apiRequest<ShippingQuote>("/shipping/quote", {
    method: "POST",
    body: { subtotal, region },
  });
  return data;
}
