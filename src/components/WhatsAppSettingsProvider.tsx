"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

const DEFAULT_WHATSAPP_NUMBER = "254768054542";
const WhatsAppNumberContext = createContext(DEFAULT_WHATSAPP_NUMBER);

export function useWhatsAppNumber(): string {
  return useContext(WhatsAppNumberContext);
}

export default function WhatsAppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [whatsappNumber, setWhatsAppNumber] = useState(DEFAULT_WHATSAPP_NUMBER);

  useEffect(() => {
    let active = true;

    apiRequest<{ whatsappNumber?: string }>("/settings", { cache: "no-store" })
      .then(({ data }) => {
        if (
          active &&
          typeof data.whatsappNumber === "string" &&
          data.whatsappNumber.trim()
        ) {
          setWhatsAppNumber(data.whatsappNumber);
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
      {children}
    </WhatsAppNumberContext.Provider>
  );
}
