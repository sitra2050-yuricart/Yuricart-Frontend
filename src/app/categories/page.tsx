import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/listing/Breadcrumb";
import { getAllCategories, getCategoryImageUrl } from "@/lib/api";
import { Category } from "@/lib/api/types";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { buildPageMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "All Categories",
  description:
    "Browse every category at Yuricart Kenya: phones, laptops, printers, accessories and more.",
  path: "/categories",
});

export default async function Page() {
  let categories: Category[] = [];
  try {
    categories = await getAllCategories();
  } catch {
    categories = [];
  }

  return (
    <main className="mx-auto max-w-[88rem] space-y-5 px-5 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <header className="rounded-2xl bg-white px-5 py-5 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:px-7">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-primary" aria-hidden />
          <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Shop by category
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Pick a category to see everything we have in stock.
        </p>
      </header>

      {categories.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category) => {
            const image = getCategoryImageUrl(category.image);
            return (
              <li key={category._id}>
                <Link
                  href={`/collections/${category.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-14px_rgba(16,24,40,0.18)] transition duration-300 hover:-translate-y-0.5 hover:ring-[#003B73]/25 hover:shadow-[0_2px_4px_rgba(16,24,40,0.05),0_18px_36px_-16px_rgba(0,59,115,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3f9]">
                    {image ? (
                      <Image
                        src={optimizeCloudinaryUrl(image, { width: 480 })}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 45vw, 240px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-serif text-3xl font-bold text-[#003B73]/40">
                        {category.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                    <span className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#003B73]">
                      {category.name}
                    </span>
                    <span
                      aria-hidden
                      className="text-primary transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white px-6 py-16 text-center text-sm text-gray-500 ring-1 ring-gray-900/5">
          No categories yet.
        </div>
      )}
    </main>
  );
}
