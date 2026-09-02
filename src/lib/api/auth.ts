import { apiRequest } from "./client";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: CustomerUser;
}

const TOKEN_KEY = "yuricart_customer_token";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearCustomerToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function registerCustomer(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  const { data } = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
  setCustomerToken(data.token);
  return data;
}

export async function loginCustomer(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
  setCustomerToken(data.token);
  return data;
}

export async function logoutCustomer(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
  clearCustomerToken();
}

export async function getCustomerMe(
  token?: string | null,
): Promise<CustomerUser | null> {
  const authToken = token ?? getCustomerToken();
  if (!authToken) return null;

  try {
    const { data } = await apiRequest<CustomerUser>("/auth/me", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return data;
  } catch {
    clearCustomerToken();
    return null;
  }
}
