import { getCategoryBySlug } from "@/lib/api";
import { orRedirectOnNotFound } from "@/lib/api/redirects";

/** Same early check as the product layout: real 404 or 308 before streaming. */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await orRedirectOnNotFound(`/collections/${slug}`, () => getCategoryBySlug(slug));
  return children;
}
