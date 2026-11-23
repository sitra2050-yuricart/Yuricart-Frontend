"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

const DEFAULT_WHATSAPP_NUMBER = "254768054542";
const WhatsAppNumberContext = createContext(DEFAULT_WHATSAPP_NUMBER);
const ShippingRateContext = createContext<number | null>(null);

export function useWhatsAppNumber(): string {
  return useContext(WhatsAppNumberContext);
}

/** Default shipping fee (KES) from admin settings, or null when not configured. */
export function useShippingRate(): number | null {
  return useContext(ShippingRateContext);
}

export default function WhatsAppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [whatsappNumber, setWhatsAppNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [shippingRate, setShippingRate] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    apiRequest<{ whatsappNumber?: string; shippingRate?: number | null }>(
      "/settings",
      { cache: "no-store" },
    )
      .then(({ data }) => {
        if (!active) return;
        if (
          typeof data.whatsappNumber === "string" &&
          data.whatsappNumber.trim()
        ) {
          setWhatsAppNumber(data.whatsappNumber);
        }
        if (typeof data.shippingRate === "number") {
          setShippingRate(data.shippingRate);
        }
      })
      .catch(() => {
        // Keep the existing contact number if the public settings request fails.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <WhatsAppNumberContext.Provider value={whatsappNumber}>
      <ShippingRateContext.Provider value={shippingRate}>
        {children}
      </ShippingRateContext.Provider>
    </WhatsAppNumberContext.Provider>
  );
}
