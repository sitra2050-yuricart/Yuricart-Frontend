"use client";

import { Suspense } from "react";
import { useCart } from "@/hooks/cart";
import Link from "next/link";
import Image from "next/image";
import SearchField from "@/components/SearchFiend";
import MobileMenu from "@/app/MobileMenu";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import UserButton from "@/components/UserButton";
import ShoppingCartButton from "@/app/ShoppingCartButton";
import { Category } from "@/lib/api/types";
import { Gift, ShoppingCart, ChevronDown } from "lucide-react";
import { useCartDrawer } from "@/components/ui/CartDrawerContext";
import { useCartStore } from "@/lib/cart/cart-store";
import { useCartHydrated } from "@/hooks/useCartHydrated";
import { cn } from "@/lib/utils";

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
        <div className="bg-[#003B73] text-white">
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
              <SearchField className="w-full [&_input]:h-10 [&_input]:rounded-full [&_input]:border-0 [&_input]:bg-white [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 md:[&_input]:h-11" />
            </div>

            <div className="hidden items-center gap-1 sm:gap-2 md:flex lg:gap-4">
              <Link
                href="/shop"
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/10"
              >
                <Gift className="size-5" />
                <span className="hidden lg:inline">Offers</span>
              </Link>

              <button
                type="button"
                onClick={openDrawer}
                aria-label={`Open cart, ${totalQuantity} items`}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/10"
              >
                <ShoppingCart className="size-5" aria-hidden="true" />
                <span className="hidden lg:inline">
                  Cart{" "}
                  <span className="text-white/80">Item {totalQuantity}</span>
                </span>
                <span className="lg:hidden" aria-hidden="true">
                  {totalQuantity}
                </span>
              </button>

              <div className="flex items-center text-white">
                <UserButton className="text-white hover:bg-white/10 hover:text-white" />
                <span className="pointer-events-none hidden items-center gap-0.5 text-sm font-medium lg:inline-flex">
                  Account
                  <ChevronDown className="size-3.5 opacity-80" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category navigation */}
        <nav className="hidden border-b border-gray-200 bg-white md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 lg:gap-8 [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  "whitespace-nowrap font-serif text-xs font-bold uppercase tracking-wide text-gray-900 transition hover:text-[#003B73] lg:text-sm",
                )}
              >
                {link.label}
              </Link>
            ))}
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
