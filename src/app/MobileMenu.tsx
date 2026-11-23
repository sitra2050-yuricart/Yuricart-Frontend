"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useAuth from "@/hooks/auth";
import { twConfig } from "@/lib/utils";
import { Category } from "@/lib/api/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";

interface MobileMenuProps {
  collections: Category[];
}

export default function MobileMenu({ collections }: MobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > parseInt(twConfig.theme.screens.md)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-6" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-full max-w-sm">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Image src="/logonew.svg" alt="Yuricart" width={40} height={40} />
              Navigation
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-8 py-8">
            <ul className="space-y-4 text-base">
              <li>
                <Link
                  href="/shop"
                  className="font-bold uppercase tracking-wide hover:text-primary"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="font-bold uppercase tracking-wide text-cta hover:underline"
                >
                  Offers
                </Link>
              </li>
              {collections.map((collection) => (
                <li key={collection._id}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="font-bold uppercase tracking-wide hover:text-primary"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <MenuAccountLinks />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function MenuAccountLinks() {
  const { user, loading } = useAuth();
  if (loading) return null;

  const link =
    "flex h-11 items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return user ? (
    <div className="mt-6 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
      <Link href="/profile#orders" className={`${link} bg-primary text-white`}>
        My orders
      </Link>
      <Link href="/profile" className={`${link} bg-white text-gray-800 ring-1 ring-gray-900/15`}>
        Profile
      </Link>
    </div>
  ) : (
    <div className="mt-6 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
      <Link href="/login" className={`${link} bg-primary text-white`}>
        Log in
      </Link>
      <Link href="/register" className={`${link} bg-white text-gray-800 ring-1 ring-gray-900/15`}>
        Sign up
      </Link>
    </div>
  );
}
