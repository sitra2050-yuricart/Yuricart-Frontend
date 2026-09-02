"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ImageIcon,
  LogOut,
  Menu,
  ShoppingCart,
  Ticket,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearAdminToken, getAdminToken } from "@/lib/admin/auth";
import { adminLogout, getAdminMe } from "@/lib/admin/services";
import { AdminUser } from "@/lib/admin/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/homepage", label: "Homepage", icon: ImageIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    getAdminMe()
      .then(({ data }) => setUser(data))
      .catch(() => {
        clearAdminToken();
        router.replace("/admin/login");
      })
      .finally(() => setChecking(false));
  }, [isLoginPage, router, pathname]);

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // ignore
    }
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-muted/30">{children}</div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-background p-4 md:block">
          <div className="mb-8 px-3">
            <Link href="/admin" className="text-lg font-bold">
              Yuricart Admin
            </Link>
            {user && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
          <NavLinks />
          <Button
            variant="ghost"
            className="mt-6 w-full justify-start gap-3 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <div className="mb-6 text-lg font-bold">Yuricart Admin</div>
                  <NavLinks />
                  <Button
                    variant="ghost"
                    className="mt-6 w-full justify-start gap-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-sm text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Store</Link>
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
