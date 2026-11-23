"use client";

import Link from "next/link";
import { ChevronDown, LogInIcon, LogOutIcon, Package, User, UserIcon } from "lucide-react";
import useAuth from "@/hooks/auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AccountMenuProps {
  /** "header" sits on the navy bar; "bottom" is the mobile tab bar. */
  variant: "header" | "bottom";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

function firstName(name: string, email: string) {
  const first = name.trim().split(/\s+/)[0];
  return first || email.split("@")[0];
}

const HEADER_BUTTON =
  "flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:pr-3";

/**
 * Shows who is signed in, with the whole control clickable. Signed out it is a plain
 * link to the login page, because a menu with two links is one click more than needed.
 */
export default function AccountMenu({ variant }: AccountMenuProps) {
  const { user, loading, logout } = useAuth();
  const header = variant === "header";

  if (loading) {
    return header ? (
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/15 lg:w-28" aria-hidden />
    ) : (
      <div className="h-10 w-12 animate-pulse rounded-lg bg-gray-100" aria-hidden />
    );
  }

  if (!user) {
    return header ? (
      <Link href="/login" className={cn(HEADER_BUTTON, "pr-2.5")}>
        <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
          <UserIcon className="size-4" aria-hidden />
        </span>
        <span className="hidden whitespace-nowrap lg:inline">Log in / Sign up</span>
        <span className="sr-only lg:hidden">Log in or sign up</span>
      </Link>
    ) : (
      <Link
        href="/login"
        className="flex flex-col items-center rounded-lg px-3 py-1 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LogInIcon className="h-5 w-5" aria-hidden />
        <span>Log in</span>
      </Link>
    );
  }

  const name = firstName(user.name ?? "", user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {header ? (
          <button type="button" className={cn(HEADER_BUTTON, "group")} aria-label={`Account menu for ${name}`}>
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
              {initials(user.name ?? user.email)}
            </span>
            <span className="hidden max-w-28 truncate lg:inline">{name}</span>
            <ChevronDown className="hidden size-3.5 opacity-80 transition group-data-[state=open]:rotate-180 lg:inline" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center rounded-lg px-3 py-1 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Account menu for ${name}`}
          >
            <User className="h-5 w-5" aria-hidden />
            <span className="max-w-16 truncate">{name}</span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={header ? "end" : "center"} sideOffset={8} className="w-64 rounded-2xl p-1.5">
        <div className="flex items-center gap-3 rounded-xl bg-brand-soft p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {initials(user.name ?? user.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{user.name || name}</p>
            <p className="truncate text-xs text-gray-700">{user.email}</p>
          </div>
        </div>
        <div className="py-1.5">
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2.5">
            <Link href="/profile#orders">
              <Package className="mr-2.5 size-4 text-gray-600" aria-hidden />
              My orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2.5">
            <Link href="/profile">
              <UserIcon className="mr-2.5 size-4 text-gray-600" aria-hidden />
              Profile
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer rounded-lg py-2.5">
          <LogOutIcon className="mr-2.5 size-4 text-gray-600" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
