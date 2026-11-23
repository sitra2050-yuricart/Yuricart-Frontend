import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/api/types";

interface CategoryStripProps {
  categories: Category[];
  /** Slug of the category being viewed (highlighted). */
  activeSlug?: string;
}

const CHIP =
  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]";

/** One-line, scrollable row of category chips (links to the category pages). */
export default function CategoryStrip({
  categories,
  activeSlug,
}: CategoryStripProps) {
  if (!categories.length) return null;

  return (
    <nav
      aria-label="Shop by category"
      className="thin-scrollbar -mx-5 overflow-x-auto px-5 pb-2 pt-1.5 sm:-mx-1 sm:px-1"
    >
      <ul className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
        <li>
          <Link
            href="/shop"
            className={cn(
              CHIP,
              !activeSlug
                ? "bg-[#003B73] text-white ring-[#003B73]"
                : "bg-white text-gray-700 ring-gray-900/10 hover:text-[#003B73] hover:ring-[#003B73]/40",
            )}
          >
            All products
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category._id}>
              <Link
                href={`/collections/${category.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  CHIP,
                  "block",
                  active
                    ? "bg-[#003B73] text-white ring-[#003B73]"
                    : "bg-white text-gray-700 ring-gray-900/10 hover:text-[#003B73] hover:ring-[#003B73]/40",
                )}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
