"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/lib/admin/services";
import { DashboardStats } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "date-fns";

const cards = [
  {
    key: "orders" as const,
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    subtitle: (s: DashboardStats) =>
      `${s.orders.pending ?? 0} pending · ${s.orders.monthly ?? 0} this month`,
  },
  {
    key: "revenue" as const,
    label: "Revenue",
    href: "/admin/orders",
    icon: DollarSign,
    format: "currency" as const,
    value: (s: DashboardStats) => s.revenue.total,
    subtitle: (s: DashboardStats) =>
      `${formatCurrency(s.revenue.monthly ?? 0)} this month`,
  },
  {
    key: "products" as const,
    label: "Products",
    href: "/admin/products",
    icon: Package,
    subtitle: (s: DashboardStats) => `${s.products.active ?? 0} active`,
  },
  {
    key: "customers" as const,
    label: "Customers",
    href: "/admin/settings",
    icon: Users,
    subtitle: (s: DashboardStats) => `${s.customers.active ?? 0} active`,
  },
];

function getCardValue(
  stats: DashboardStats,
  key: (typeof cards)[number]["key"],
  format?: "currency",
) {
  const value = stats[key].total;
  return format === "currency" ? formatCurrency(value) : value;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Overview of your store" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, href, icon: Icon, subtitle, format }) => (
          <Link
            key={key}
            href={href}
            className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {label}
              </span>
              <Icon className="size-5 text-primary" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : stats ? (
              <>
                <p className="text-3xl font-bold">
                  {getCardValue(stats, key, format)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {subtitle(stats)}
                </p>
              </>
            ) : null}
          </Link>
        ))}
      </div>

      {!loading && stats?.recentOrders?.length ? (
        <section className="rounded-xl border bg-background p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent orders</h2>
          <ul className="space-y-3">
            {stats.recentOrders.map((order) => (
              <li
                key={order.orderNumber}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-medium">{order.orderNumber}</span>
                <span className="text-muted-foreground">
                  {order.customerName}
                </span>
                <span>{formatCurrency(order.total)}</span>
                <span className="capitalize text-muted-foreground">
                  {order.orderStatus}
                </span>
                {order.createdAt && (
                  <span className="text-muted-foreground">
                    {formatDate(new Date(order.createdAt), "MMM d, yyyy")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
