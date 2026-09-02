import { ApiResponse, PaginationMeta } from "./types";

export class StorefrontApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status = 400, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: PaginationMeta }> {
  const { body, params, headers, cache, next, ...rest } = options;

  const url = new URL(`${getApiBaseUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(url.toString(), {
    ...rest,
    cache,
    next,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  clearTimeout(timeout);

  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new StorefrontApiError("Invalid API response", response.status);
  }

  if (!response.ok || !json.success) {
    throw new StorefrontApiError(
      json.message || "Request failed",
      response.status,
      json.errors,
    );
  }

  return { data: json.data, meta: json.meta };
}

export async function apiRequestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta: PaginationMeta }> {
  const result = await apiRequest<T>(path, options);

  return {
    data: result.data,
    meta: result.meta || {
      page: 1,
      limit: 20,
      total: Array.isArray(result.data) ? result.data.length : 1,
      totalPages: 1,
    },
  };
}
