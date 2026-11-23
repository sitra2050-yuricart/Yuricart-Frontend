import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/listing/Breadcrumb";
import { getBrandLogoUrl, getNavBrands } from "@/lib/api";
import type { Brand } from "@/lib/api/types";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop by Brand",
  description:
    "Browse laptops, printers and accessories by brand at Yuricart Kenya: HP, Lenovo, Dell, Epson and more.",
  path: "/brands",
});

export default async function Page() {
  let brands: Brand[] = [];
  try {
    brands = await getNavBrands();
  } catch {
    brands = [];
  }

  return (
    <main className="mx-auto max-w-[88rem] space-y-5 px-5 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />

      <header className="rounded-2xl bg-white px-5 py-5 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:px-7">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Shop by brand
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Pick a brand to see everything we have from it.
        </p>
      </header>

      {brands.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {brands.map((brand) => {
            const logo = getBrandLogoUrl(brand);
            return (
              <li key={brand._id}>
                <Link
                  href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl bg-white px-4 py-6 text-center ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-14px_rgba(16,24,40,0.18)] transition duration-300 hover:-translate-y-0.5 hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative flex h-16 w-full items-center justify-center">
                    {logo ? (
                      <Image
                        src={optimizeCloudinaryUrl(logo, { width: 240 })}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-xl font-bold text-primary"
                      >
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {brand.name}
                  </span>
                  {typeof brand.productCount === "number" ? (
                    <span className="-mt-2 text-xs text-gray-600">
                      {brand.productCount} {brand.productCount === 1 ? "product" : "products"}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-gray-900/5">
          <p className="text-lg font-bold text-gray-900">No brands to show yet</p>
          <Link
            href="/shop"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Shop all products
          </Link>
        </div>
      )}
    </main>
  );
}
