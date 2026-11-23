"use client";

import { usePathname } from "next/navigation";
import { CartDrawerProvider } from "@/components/ui/CartDrawerContext";
import WhatsAppSettingsProvider from "@/components/WhatsAppSettingsProvider";

type AppChromeProps = {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  whatsapp: React.ReactNode;
};

export default function AppChrome({
  children,
  navbar,
  footer,
  whatsapp,
}: AppChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  // Only the admin area has its own chrome. Login, checkout and the 404 page keep
  // the standard header and footer so shoppers can always get back to the store.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <WhatsAppSettingsProvider>
      <CartDrawerProvider>
        {navbar}
        <div className="min-h-[50vh]">{children}</div>
        {footer}
        {whatsapp}
      </CartDrawerProvider>
    </WhatsAppSettingsProvider>
  );
}
