"use client";

import { useEffect, useState } from "react";
import { trackLead } from "@/lib/metaPixel";

const WHATSAPP_URL =
  "https://wa.me/254768054542?text=" +
  encodeURIComponent("Hello, I need help with a product on Yuricart.");

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onClick={() => trackLead({ content_name: "Floating WhatsApp" })}
      className="fixed bottom-20 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] md:bottom-6 md:right-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="size-8"
        fill="currentColor"
      >
        <path d="M16.004 2.667c-7.364 0-13.333 5.97-13.333 13.333 0 2.35.618 4.64 1.79 6.66L2.667 29.333l6.86-1.76A13.27 13.27 0 0 0 16.004 29.333c7.364 0 13.333-5.97 13.333-13.333S23.368 2.667 16.004 2.667zm0 24a10.6 10.6 0 0 1-5.404-1.48l-.387-.23-4.07 1.044 1.086-3.97-.252-.408A10.6 10.6 0 0 1 5.337 16c0-5.89 4.79-10.667 10.667-10.667S26.67 10.11 26.67 16s-4.79 10.667-10.666 10.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.106-.507-.16-.72.16-.213.32-.827 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.573-1.587-.951-.847-1.593-1.893-1.78-2.213-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.26-.622-.527-.538-.72-.547l-.613-.012c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.46 4.827 2.027.873 2.547.88 3.013.827.48-.053 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
      </svg>
    </a>
  );
}
