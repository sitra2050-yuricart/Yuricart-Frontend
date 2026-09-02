"use client";

import LoadingButton from "@/components/LoadingButton";
import Order from "@/components/Order";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyOrders } from "@/lib/api/orders";
import { getCustomerToken } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";

export default function Orders() {
  const { data: orders, status } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const token = getCustomerToken();
      if (!token) return [];
      return getMyOrders(token);
    },
  });

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Your orders</h2>
      {status === "pending" && <OrdersLoadingSkeleton />}
      {status === "error" && (
        <p className="text-destructive">Error fetching orders</p>
      )}
      {status === "success" && !orders?.length && <p>No orders yet</p>}
      {orders?.map((order) => (
        <Order key={order.orderNumber} order={order} />
      ))}
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}
