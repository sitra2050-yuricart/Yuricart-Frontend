/** Only follow `?next=` values that stay on this site. */
export function safeNextPath(next: string | null | undefined, fallback = "/profile"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
