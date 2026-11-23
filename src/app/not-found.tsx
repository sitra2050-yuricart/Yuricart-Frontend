import Link from "next/link";
import { getAllCategories } from "@/lib/api";
import type { Category } from "@/lib/api/types";
import SearchField from "@/components/SearchFiend";

export default async function NotFound() {
  const categories: Category[] = await getAllCategories().catch(() => []);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-5 py-16 text-center">
      <div>
        <p className="text-sm font-semibold text-[#003B73]">Error 404</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-gray-600">
          The link may be old or the product may have been renamed. Search, or
          pick a category.
        </p>
      </div>

      <SearchField className="mx-auto w-full max-w-md [&_input]:h-11 [&_input]:rounded-full [&_input]:bg-white" />

      {categories.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                href={`/collections/${category.slug}`}
                className="inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/10 transition hover:text-[#003B73] hover:ring-[#003B73]/40"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-[#003B73] px-6 text-sm font-semibold text-white transition hover:bg-[#002f5d]"
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/10 transition hover:text-[#003B73]"
        >
          Shop all products
        </Link>
      </div>
    </main>
  );
}
