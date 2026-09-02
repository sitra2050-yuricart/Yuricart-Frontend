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

export async function trackOrder(
  orderNumber: string,
  email: string,
): Promise<Order> {
  const { data } = await apiRequest<Order>(`/orders/track/${orderNumber}`, {
    params: { email },
  });
  return data;
}

export async function getMyOrders(token: string): Promise<Order[]> {
  const { data } = await apiRequest<Order[]>("/orders/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
