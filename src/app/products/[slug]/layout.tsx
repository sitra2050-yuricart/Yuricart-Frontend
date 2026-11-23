import { getProductBySlug } from "@/lib/api";
import { orRedirectOnNotFound } from "@/lib/api/redirects";

/**
 * Checks the product exists before anything is streamed. A layout sits above
 * loading.tsx's Suspense boundary, so a missing product gets a real 404 and a
 * renamed one a real 308, instead of a 200 "soft 404" that search engines
 * index. The fetch is cached, so the page reuses this result.
 */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await orRedirectOnNotFound(`/products/${slug}`, () => getProductBySlug(slug));
  return children;
}
