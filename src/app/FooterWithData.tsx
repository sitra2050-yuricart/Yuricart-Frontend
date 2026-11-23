import { getNavCategories } from "@/lib/api";
import type { Category } from "@/lib/api/types";
import Footer from "./Footer";

/** Server wrapper: fetches categories for the footer links. */
export default async function FooterWithData() {
  const categories: Category[] = await getNavCategories().catch(() => []);
  return <Footer categories={categories} />;
}
