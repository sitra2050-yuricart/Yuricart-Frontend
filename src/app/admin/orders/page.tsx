"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getAdminOrders, updateAdminOrder } from "@/lib/admin/services";
import { AdminOrder } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function OrdersPageContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const pendingUpdate = useRef<Map<string, string>>(new Map());
  const pendingPaymentUpdate = useRef<Map<string, string>>(new Map());

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await getAdminOrders({ page, limit: 10 });
      setItems(data);
      setPage(meta?.page || 1);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      toast({
        title: "Failed to load orders",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(id: string, orderStatus: string) {
    if (pendingUpdate.current.has(id)) return;

    pendingUpdate.current.set(id, orderStatus);
    setUpdatingId(id);

    const previousItems = items;
    setItems((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, orderStatus } : o,
      ),
    );

    try {
      await updateAdminOrder(id, { orderStatus });
      toast({ title: "Order status updated" });
      pendingUpdate.current.delete(id);
      setUpdatingId(null);
      loadOrders();
    } catch (error) {
      setItems(previousItems);
      pendingUpdate.current.delete(id);
      setUpdatingId(null);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handlePaymentStatusChange(id: string, paymentStatus: string) {
    if (pendingPaymentUpdate.current.has(id)) return;

    pendingPaymentUpdate.current.set(id, paymentStatus);
    setUpdatingPaymentId(id);

    const previousItems = items;
    setItems((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, paymentStatus } : o,
      ),
    );

    try {
      await updateAdminOrder(id, { paymentStatus });
      toast({ title: "Payment status updated" });
      pendingPaymentUpdate.current.delete(id);
      setUpdatingPaymentId(null);
      loadOrders();
    } catch (error) {
      setItems(previousItems);
      pendingPaymentUpdate.current.delete(id);
      setUpdatingPaymentId(null);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <PageHeader title="Orders" description="Manage customer orders" />
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order._id} className="border-t">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.customerName}</div>
                    <div className="text-muted-foreground">{order.email}</div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.paymentStatus}
                        onValueChange={(value) =>
                          handlePaymentStatusChange(order._id, value)
                        }
                        disabled={updatingPaymentId === order._id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingPaymentId === order._id && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.orderStatus}
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value)
                        }
                        disabled={updatingId === order._id}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingId === order._id && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPagination page={page} totalPages={totalPages} />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersPageContent />
    </Suspense>
  );
}
