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

/** Sign-in pages are focused screens: no header, footer or chat button. */
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export default function AppChrome({
  children,
  navbar,
  footer,
  whatsapp,
}: AppChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // The admin area has its own chrome. Checkout and the 404 page keep the standard
  // header and footer so shoppers can always get back to the store.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (isAuthRoute) {
    return (
      <WhatsAppSettingsProvider>
        <CartDrawerProvider>{children}</CartDrawerProvider>
      </WhatsAppSettingsProvider>
    );
  }

  return (
    <WhatsAppSettingsProvider>
      <CartDrawerProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-lg focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        {navbar}
        <div id="main-content" tabIndex={-1} className="min-h-[50vh] outline-none">
          {children}
        </div>
        {footer}
        {whatsapp}
      </CartDrawerProvider>
    </WhatsAppSettingsProvider>
  );
}
