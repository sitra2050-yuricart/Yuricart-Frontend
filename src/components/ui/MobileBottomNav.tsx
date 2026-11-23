"use client";

import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart } from "lucide-react";
import { useCartDrawer } from "@/components/ui/CartDrawerContext";
import { useCartStore } from "@/lib/cart/cart-store";
import { useCartHydrated } from "@/hooks/useCartHydrated";
import AccountMenu from "@/components/AccountMenu";

export default function MobileBottomNav() {
  const { openDrawer } = useCartDrawer();
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);

  const totalQuantity = hydrated
    ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  return (
    <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-inner lg:hidden">
      <ul className="flex items-center justify-around py-2">
        <li>
          <Link
            href="/"
            className="flex flex-col items-center text-xs text-gray-700 rounded-lg px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
        </li>

        <li>
          <Link
            href="/shop"
            className="flex flex-col items-center text-xs text-gray-700 rounded-lg px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Shop</span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={
              totalQuantity > 0
                ? `Open cart, ${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`
                : "Open cart, empty"
            }
            className="relative flex flex-col items-center text-xs text-gray-700 rounded-lg px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalQuantity > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white"
              >
                {totalQuantity}
              </span>
            )}
            <span>Cart</span>
          </button>
        </li>

        <li>
          <AccountMenu variant="bottom" />
        </li>
      </ul>
    </nav>
  );
}
