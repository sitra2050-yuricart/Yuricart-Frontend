"use client";

import Link from "next/link";
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  LogOutIcon,
  LogInIcon,
  UserPlus,
} from "lucide-react";
import { useCartDrawer } from "@/components/ui/CartDrawerContext";
import { useCartStore } from "@/lib/cart/cart-store";
import { useCartHydrated } from "@/hooks/useCartHydrated";
import useAuth from "@/hooks/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function MobileBottomNav() {
  const { openDrawer } = useCartDrawer();
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const { user, logout, openLogin } = useAuth();

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center text-xs text-gray-700 rounded-lg px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <User className="h-5 w-5" />
                <span>Account</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44 max-w-64">
              {user && (
                <>
                  <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>User Profile</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOutIcon className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => openLogin()}>
                    <LogInIcon className="mr-2 size-4" />
                    Log in
                  </DropdownMenuItem>
                  <Link href="/register">
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 size-4" />
                      Create account
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
}
