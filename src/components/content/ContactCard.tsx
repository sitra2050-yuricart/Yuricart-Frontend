"use client";

import { MapPin, MessageCircle } from "lucide-react";
import { useWhatsAppNumber } from "@/components/WhatsAppSettingsProvider";
import { SHOP_INFO } from "@/lib/shop-info";

/** WhatsApp and the shop address, with a link to open the map. */
export default function ContactCard() {
  const digits = useWhatsAppNumber().replace(/\D/g, "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SHOP_INFO.name}, ${SHOP_INFO.addressOneLine}`,
  )}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-5">
        <MessageCircle className="size-6 text-primary" aria-hidden />
        <h2 className="text-lg font-bold text-gray-900">WhatsApp</h2>
        <p className="text-sm text-gray-700">Message us any time. We reply as soon as we can.</p>
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex h-11 w-fit items-center rounded-full bg-whatsapp px-6 text-sm font-semibold text-white transition hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
        >
          Chat on WhatsApp
        </a>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-5">
        <MapPin className="size-6 text-primary" aria-hidden />
        <h2 className="text-lg font-bold text-gray-900">Visit the shop</h2>
        <address className="text-sm not-italic leading-relaxed text-gray-700">
          {SHOP_INFO.addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex h-11 w-fit items-center rounded-full bg-white px-6 text-sm font-semibold text-primary ring-1 ring-primary/30 transition hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Open in Google Maps
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
