import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { getNavCategories, getProducts } from "@/lib/api";
import type { Category, Product } from "@/lib/api/types";
import { SHOP_INFO } from "@/lib/shop-info";

const TRUST = [
  { icon: Truck, title: "Fast delivery", text: "Nairobi and countrywide" },
  {
    icon: ShieldCheck,
    title: "Warranty on every laptop",
    text: "Tested before it ships",
  },
  {
    icon: MessageCircle,
    title: "Order on WhatsApp",
    text: "Pay on delivery or M-Pesa",
  },
];

/**
 * Shown when the homepage data call fails. It makes its own small, independent
 * requests and still renders real navigation if those fail too, so visitors
 * never land on a bare error.
 */
export default async function HomeFallback() {
  const [categories, products] = await Promise.all([
    getNavCategories().catch((): Category[] => []),
    getProducts({ limit: 10, sort: "createdAt_desc" })
      .then((r) => r.items)
      .catch((): Product[] => []),
  ]);

  return (
    <main className="bg-[#f7f8fa]">
      <div className="mx-auto max-w-[88rem] space-y-8 px-3 py-6 sm:px-5 md:py-10">
        <section className="rounded-2xl bg-[#003B73] px-6 py-10 text-white sm:px-10 sm:py-14">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Laptops, printers and accessories in Nairobi
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            Visit {SHOP_INFO.addressOneLine}, or order online with delivery
            across Kenya.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Shop all products <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/categories"
              className="inline-flex h-11 items-center rounded-full bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              Browse categories
            </Link>
          </div>
        </section>

        <ul className="grid gap-3 sm:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-900/5"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[#eef3f9] text-[#003B73]">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {title}
                </span>
                <span className="block text-xs text-gray-600">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        {categories.length > 0 && (
          <section aria-labelledby="fallback-categories">
            <h2
              id="fallback-categories"
              className="mb-3 text-xl font-bold text-gray-900"
            >
              Shop by category
            </h2>
            <ul className="flex flex-wrap gap-2">
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
          </section>
        )}

        {products.length > 0 && (
          <section aria-labelledby="fallback-new">
            <h2
              id="fallback-new"
              className="mb-3 text-xl font-bold text-gray-900"
            >
              New arrivals
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  priority={i < 5}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
