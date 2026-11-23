import { notFound, permanentRedirect, redirect } from "next/navigation";
import { apiRequest, StorefrontApiError } from "./client";

export interface ResolvedRedirect {
  to: string;
  statusCode: 301 | 302;
}

/** Asks the API where an old path should go. Never throws; null means "no redirect". */
export async function resolveRedirect(path: string): Promise<ResolvedRedirect | null> {
  try {
    const { data } = await apiRequest<ResolvedRedirect>("/redirects/resolve", {
      params: { path },
      next: { revalidate: 300 },
    });
    return data?.to ? data : null;
  } catch {
    return null;
  }
}

/** True for the API's "does not exist" answer (as opposed to an outage). */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof StorefrontApiError && error.status === 404;
}

/**
 * Called when a catalog page does not exist: follow a redirect for a renamed
 * product or category (or a manual redirect), otherwise show the 404 page.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const target = await resolveRedirect(path);
  if (target && target.to !== path) {
    if (target.statusCode === 302) redirect(target.to);
    permanentRedirect(target.to);
  }
  notFound();
}

/** Runs a lookup; on a 404 follows a redirect or shows the 404 page. Other errors still throw. */
export async function orRedirectOnNotFound<T>(
  path: string,
  lookup: () => Promise<T>,
): Promise<T> {
  try {
    return await lookup();
  } catch (error) {
    if (isNotFoundError(error)) return redirectOrNotFound(path);
    throw error;
  }
}
