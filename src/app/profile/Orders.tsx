"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import OrderCard from "@/components/order/OrderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyOrders } from "@/lib/api/orders";
import { getCustomerToken } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";

export default function Orders() {
  const { data: orders, status, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const token = getCustomerToken();
      if (!token) return [];
      return getMyOrders(token);
    },
  });

  return (
    <section id="orders" aria-labelledby="orders-title" className="scroll-mt-24 space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="orders-title" className="text-xl font-bold text-gray-900">
          Your orders
        </h2>
        {status === "success" && orders?.length ? (
          <span className="text-sm text-gray-600">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        ) : null}
      </div>

      {status === "pending" && (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-900 ring-1 ring-red-200">
          <p className="font-semibold">We could not load your orders.</p>
          <button type="button" onClick={() => refetch()} className="mt-1 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {status === "success" && !orders?.length && (
        <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-gray-900/10">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-primary">
            <ShoppingBag className="size-6" aria-hidden />
          </span>
          <p className="mt-3 font-semibold text-gray-900">No orders yet</p>
          <p className="mt-1 text-sm text-gray-700">
            Orders you place while logged in show up here.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Start shopping
          </Link>
        </div>
      )}

      {orders?.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
