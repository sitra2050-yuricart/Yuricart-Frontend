"use client";

import Link from "next/link";
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Monitor,
  Sun,
  Moon,
  Check,
  LogOutIcon,
  LogInIcon,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export default function MobileBottomNav() {
  const { openDrawer } = useCartDrawer();
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const { user, logout, openLogin } = useAuth();
  const { theme, setTheme } = useTheme();

  const totalQuantity = hydrated
    ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-inner lg:hidden">
      <ul className="flex items-center justify-around py-2">
        <li>
          <Link
            href="/"
            className="flex flex-col items-center text-xs text-gray-600"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
        </li>

        <li>
          <Link
            href="/shop"
            className="flex flex-col items-center text-xs text-gray-600"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Shop</span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open cart, ${totalQuantity} items`}
            className="relative flex flex-col items-center text-xs text-gray-600"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {totalQuantity}
            </span>
            <span>Cart</span>
          </button>
        </li>

        <li>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center text-xs text-gray-600">
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

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Monitor className="mr-2 size-4" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 size-4" />
                      System {theme === "system" && <Check className="ms-2 size-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 size-4" />
                      Light {theme === "light" && <Check className="ms-2 size-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 size-4" />
                      Dark {theme === "dark" && <Check className="ms-2 size-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOutIcon className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => openLogin()}>
                  <LogInIcon className="mr-2 size-4" />
                  Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
}
