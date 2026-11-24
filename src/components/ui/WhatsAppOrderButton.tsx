"use client";

import { cn } from "@/lib/utils";
import { trackLead } from "@/lib/metaPixel";

interface WhatsAppOrderButtonProps {
  phoneNumber: string;
  productName?: string | null;
  productUrl: string;
  quantity: number;
  salePrice: number;
  label?: string;
  className?: string;
  /** Optional delivery location typed on the product page; added to the message. */
  deliveryLocation?: string;
  /** Ask for the price instead of placing an order (products without a price). */
  enquiry?: boolean;
  /** Phones: show only the WhatsApp icon (the label stays for screen readers and larger screens). */
  iconOnlyOnMobile?: boolean;
}

export default function WhatsAppOrderButton({
  phoneNumber,
  productName,
  productUrl,
  quantity,
  salePrice,
  label = "Order via WhatsApp",
  className,
  deliveryLocation,
  enquiry = false,
  iconOnlyOnMobile = false,
}: WhatsAppOrderButtonProps) {
  const totalPrice = salePrice * quantity;
  const location = deliveryLocation?.trim();

  const message = enquiry
    ? `Hi, what is the price of this product?

*${productName}*
${productUrl}`
    : `Hi, I want to order this product:\n\n*${productName}*\nQuantity: ${quantity}\nSale Price: ${totalPrice}${
    location ? `\nDelivery location: ${location}` : ""
  }\n${productUrl}`;

  const waLink = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackLead({
          content_name: productName ?? undefined,
          ...(enquiry ? {} : { value: totalPrice, currency: "KES" }),
        })
      }
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700/80",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="size-5 shrink-0"
        fill="currentColor"
      >
        <path d="M16.004 2.667c-7.364 0-13.333 5.97-13.333 13.333 0 2.35.618 4.64 1.79 6.66L2.667 29.333l6.86-1.76A13.27 13.27 0 0 0 16.004 29.333c7.364 0 13.333-5.97 13.333-13.333S23.368 2.667 16.004 2.667zm0 24a10.6 10.6 0 0 1-5.404-1.48l-.387-.23-4.07 1.044 1.086-3.97-.252-.408A10.6 10.6 0 0 1 5.337 16c0-5.89 4.79-10.667 10.667-10.667S26.67 10.11 26.67 16s-4.79 10.667-10.666 10.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.106-.507-.16-.72.16-.213.32-.827 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.573-1.587-.951-.847-1.593-1.893-1.78-2.213-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.26-.622-.527-.538-.72-.547l-.613-.012c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.46 4.827 2.027.873 2.547.88 3.013.827.48-.053 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
      </svg>
      <span className={cn(iconOnlyOnMobile && "sr-only md:not-sr-only")}>{label}</span>
    </a>
  );
}
