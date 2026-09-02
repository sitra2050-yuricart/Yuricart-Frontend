import { getAllCategories } from "@/lib/api";
import NavbarClient from "@/components/ui/NavbarClient";
import { Category } from "@/lib/api/types";

export default async function Navbar() {
  let collections: Category[] = [];
  try {
    collections = await getAllCategories();
  } catch {
    collections = [];
  }

  return <NavbarClient collections={collections} />;
}
