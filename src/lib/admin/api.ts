import { ApiResponse, PaginationMeta } from "./types";
import { clearAdminToken, getAdminToken } from "./auth";

export class AdminApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status = 400, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function adminApiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: PaginationMeta }> {
  const { body, params, headers, ...rest } = options;
  const token = getAdminToken();

  const url = new URL(`${getApiBaseUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const isFormData = body instanceof FormData;

  const response = await fetch(url.toString(), {
    ...rest,
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    if (response.status === 401) {
      clearAdminToken();
    }
    throw new AdminApiError(
      json.message || "Request failed",
      response.status,
      json.errors,
    );
  }

  return { data: json.data, meta: json.meta };
}
