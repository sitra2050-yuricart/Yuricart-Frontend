"use client";

import { usePathname } from "next/navigation";
import { CartDrawerProvider } from "@/components/ui/CartDrawerContext";

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
  const isLoginRoute = pathname === "/login";

  if (isAdminRoute || isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <CartDrawerProvider>
      {navbar}
      <div className="min-h-[50vh]">{children}</div>
      {footer}
      {whatsapp}
    </CartDrawerProvider>
  );
}
