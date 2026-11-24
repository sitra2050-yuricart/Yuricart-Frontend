import Link from "next/link";
import type { Brand } from "@/lib/api/types";
import { formatBrandName } from "@/lib/brand-name";

/**
 * Brand names linking to the filtered shop. Names only, formatted the same way: the
 * images saved on brands are product photos rather than logos, so showing them made one
 * tile look different from the rest. Renders nothing without brands.
 */
export default function BrandsStrip({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;

  return (
    <section aria-labelledby="brands-strip" className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h2 id="brands-strip" className="text-xl font-bold text-gray-900">
          Shop by brand
        </h2>
        <Link
          href="/brands"
          className="rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          All brands
        </Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {brands.slice(0, 12).map((brand) => {
          return (
            <li key={brand._id}>
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                className="flex h-12 min-w-24 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/10 transition hover:text-primary hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {formatBrandName(brand.name)}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
