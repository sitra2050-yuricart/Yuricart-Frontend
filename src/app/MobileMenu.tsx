"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import UserButton from "@/components/UserButton";
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
                  className="font-serif font-bold uppercase tracking-wide hover:text-[#003B73]"
                >
                  Shop All
                </Link>
              </li>
              {collections.map((collection) => (
                <li key={collection._id}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="font-serif font-bold uppercase tracking-wide hover:text-[#003B73]"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <UserButton />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
