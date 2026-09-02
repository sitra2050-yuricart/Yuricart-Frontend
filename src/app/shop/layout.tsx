import { getAllCategories } from "@/lib/api";
import { Category } from "@/lib/api/types";
import SearchFilterLayout from "./SearchFilterLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Category[] = [];
  try {
    categories = await getAllCategories();
  } catch {
    categories = [];
  }

  return (
    <SearchFilterLayout collections={categories}>{children}</SearchFilterLayout>
  );
}
