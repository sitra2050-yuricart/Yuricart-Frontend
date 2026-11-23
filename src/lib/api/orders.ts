import { apiRequest } from "./client";
import { Order } from "./types";

export interface CreateOrderPayload {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county?: string;
  postalCode?: string;
  items: Array<{
    productId: string;
    quantity: number;
    options?: Record<string, string>;
  }>;
  paymentMethod: "cod" | "whatsapp" | "mpesa";
  couponCode?: string;
  notes?: string;
}

export async function createOrder(
  payload: CreateOrderPayload,
  token?: string | null,
): Promise<Order> {
  const { data } = await apiRequest<Order>("/orders", {
    method: "POST",
    body: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

/** Look an order up with the checkout email, or with the token from an emailed link. */
export async function trackOrder(
  orderNumber: string,
  access: { email?: string; token?: string },
): Promise<Order> {
  const { data } = await apiRequest<Order>(`/orders/track/${orderNumber}`, {
    params: access.token ? { token: access.token } : { email: access.email },
  });
  return data;
}

/** Emails the order numbers placed with an address. The answer never says whether any exist. */
export async function requestOrderNumbers(email: string): Promise<string> {
  const { data } = await apiRequest<{ message: string }>("/orders/lookup", {
    method: "POST",
    body: { email },
  });
  return data.message;
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const { data } = await apiRequest<Order[]>("/orders/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
