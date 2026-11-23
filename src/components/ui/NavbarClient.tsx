"use client";

import { Suspense } from "react";
import { useCart } from "@/hooks/cart";
import Link from "next/link";
import Image from "next/image";
import SearchField from "@/components/SearchFiend";
import MobileMenu from "@/app/MobileMenu";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import AccountMenu from "@/components/AccountMenu";
import ShoppingCartButton from "@/app/ShoppingCartButton";
import { Category } from "@/lib/api/types";
import { Gift, ShoppingCart } from "lucide-react";
import { useCartDrawer } from "@/components/ui/CartDrawerContext";
import { useCartStore } from "@/lib/cart/cart-store";
import { useCartHydrated } from "@/hooks/useCartHydrated";

interface NavbarClientProps {
  collections: Category[];
}

export default function NavbarClient({ collections }: NavbarClientProps) {
  const { data: cartData } = useCart();
  const { openDrawer } = useCartDrawer();
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const storeQuantity = items.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0,
  );
  const apiQuantity =
    cartData?.lineItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) ||
    0;
  // SSR + first client paint stay at 0 until persist rehydrates
  const totalQuantity = hydrated ? storeQuantity || apiQuantity : 0;

  const navLinks = [
    { href: "/shop", label: "SHOP ALL" },
    ...collections.map((c) => ({
      href: `/collections/${c.slug}`,
      label: c.name.toUpperCase(),
    })),
  ];

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Top blue bar */}
        <div className="bg-primary text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 md:gap-6 md:px-5 md:py-3.5">
            <Suspense>
              <div className="md:hidden">
                <MobileMenu collections={collections} />
              </div>
            </Suspense>

            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="/logonew.svg"
                alt="Yuricart Electronics"
                width={48}
                height={48}
                className="brightness-0 invert md:h-14 md:w-14"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <SearchField className="w-full [&_input]:h-10 [&_input]:rounded-full [&_input]:border-0 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-500 md:[&_input]:h-11" />
            </div>

            <div className="hidden items-center gap-1 sm:gap-2 md:flex lg:gap-4">
              <Link
                href="/offers"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Gift className="size-5" aria-hidden="true" />
                <span className="hidden lg:inline">Offers</span>
              </Link>

              <button
                type="button"
                onClick={openDrawer}
                aria-label={
                  totalQuantity > 0
                    ? `Open cart, ${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`
                    : "Open cart, empty"
                }
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="relative">
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  {totalQuantity > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold leading-none text-white"
                    >
                      {totalQuantity}
                    </span>
                  )}
                </span>
                <span className="ml-2 hidden lg:inline">Cart</span>
              </button>

              <AccountMenu variant="header" />
            </div>
          </div>
        </div>

        {/* Category navigation */}
        <nav
          aria-label="Categories"
          className="hidden border-b border-gray-200 bg-white md:block"
        >
          <div className="mx-auto max-w-7xl px-4 py-1.5">
            <ul className="thin-scrollbar mx-auto flex w-max max-w-full items-center gap-5 overflow-x-auto px-1 py-1 lg:gap-7">
              {navLinks.map((link) => (
                <li key={link.href + link.label} className="shrink-0">
                  <Link
                    href={link.href}
                    className="whitespace-nowrap rounded text-xs font-bold uppercase tracking-wide text-gray-900 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="shrink-0">
                <Link
                  href="/offers"
                  className="whitespace-nowrap rounded text-xs font-bold uppercase tracking-wide text-cta transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:text-sm"
                >
                  OFFERS
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Cart sheet host (trigger hidden; opened via header / bottom nav) */}
        <div className="[&>div:first-child]:hidden">
          <ShoppingCartButton initialData={cartData} />
        </div>

        <MobileBottomNav />
      </header>
    </>
  );
}
