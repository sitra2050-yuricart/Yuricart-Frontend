"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useWhatsAppNumber } from "@/components/WhatsAppSettingsProvider";
import type { Category } from "@/lib/api/types";
import { SHOP_INFO } from "@/lib/shop-info";

interface FooterProps {
  categories?: Category[];
}

export default function Footer({ categories = [] }: FooterProps) {
  const whatsappNumber = useWhatsAppNumber();
  const waDigits = whatsappNumber.replace(/\D/g, "");

  return (
    <footer className="bg-[#F4F4F4] pb-24 pt-12 sm:pt-16 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{SHOP_INFO.name}</h2>
            <address className="mt-4 flex items-start gap-2 text-sm not-italic leading-relaxed text-gray-700">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#003B73]" aria-hidden />
              <span>
                {SHOP_INFO.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </address>
            <ul className="mt-5 flex items-center gap-3">
              <SocialLink
                href="https://www.facebook.com/yuricarts/"
                label="Facebook"
              >
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
              </SocialLink>
              <SocialLink
                href="https://www.instagram.com/yuricart_electronics"
                label="Instagram"
              >
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.6A4.4 4.4 0 1 0 16.4 13 4.4 4.4 0 0 0 12 8.6zm6.7-3.3a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z" />
              </SocialLink>
              <SocialLink
                href="https://www.tiktok.com/@yuritechs"
                label="TikTok"
              >
                <path d="M220 89.6a54.5 54.5 0 0 1-31.6-10.1A54.7 54.7 0 0 1 174 48h-28v116.5a24.5 24.5 0 1 1-16-23.1V109a52.5 52.5 0 1 0 36 49.5V97.9a86.8 86.8 0 0 0 54 18.7V89.6z" />
              </SocialLink>
            </ul>
          </div>

          <nav aria-label="Shop">
            <h2 className="text-sm font-bold text-gray-900">Shop</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
              <FooterLink href="/shop">All products</FooterLink>
              <FooterLink href="/offers">Offers</FooterLink>
              <FooterLink href="/categories">All categories</FooterLink>
            </ul>
          </nav>

          <nav aria-label="Categories">
            <h2 className="text-sm font-bold text-gray-900">Categories</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
              {categories.slice(0, 8).map((category) => (
                <FooterLink key={category._id} href={`/collections/${category.slug}`}>
                  {category.name}
                </FooterLink>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold text-gray-900">Talk to us</h2>
            <p className="mt-4 text-sm text-gray-700">
              Questions about a laptop, a price or delivery? Message us and we
              will reply.
            </p>
            <a
              href={`https://wa.me/${waDigits}`}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#1a7f43] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15683a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a7f43] focus-visible:ring-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-gray-300 pt-6 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} {SHOP_INFO.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="rounded transition hover:text-[#003B73] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isTikTok = label === "TikTok";
  return (
    <li>
      <a
        href={href}
        aria-label={label}
        title={label}
        className="flex size-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-[#003B73]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={isTikTok ? "0 0 256 256" : "0 0 24 24"}
          fill="currentColor"
        >
          {children}
        </svg>
      </a>
    </li>
  );
}
