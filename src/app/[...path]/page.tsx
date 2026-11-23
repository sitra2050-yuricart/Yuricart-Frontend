import { redirectOrNotFound } from "@/lib/api/redirects";

interface PageProps {
  params: Promise<{ path: string[] }>;
}

/**
 * Catches every URL no other route handles. If the path is an old address
 * (a manual redirect, or a renamed product or category) it is redirected;
 * otherwise the normal 404 page is shown.
 */
export default async function Page({ params }: PageProps) {
  const { path } = await params;
  const pathname = `/${path.map(decodeURIComponent).join("/")}`;
  return redirectOrNotFound(pathname);
}
