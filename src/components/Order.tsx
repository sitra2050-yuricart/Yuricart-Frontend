import { cn, formatCurrency } from "@/lib/utils";
import { formatDate } from "date-fns";
import Link from "next/link";
import Badge from "./ui/badge";
import ProductImage from "./ProductImage";
import type { Order as StorefrontOrder } from "@/lib/api/types";

interface OrderProps {
  order: StorefrontOrder;
}

export default function Order({ order }: OrderProps) {
  const paymentStatusMap: Record<string, string> = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
  };

  const orderStatusMap: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="w-full space-y-5 border p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold">Order #{order.orderNumber}</span>
        {order.createdAt && (
          <span>{formatDate(new Date(order.createdAt), "MMM d, yyyy")}</span>
        )}
        <Link
          href={`https://wa.me/254768054542?text=${encodeURIComponent(`I need help with order #${order.orderNumber}`)}`}
          className="ms-auto text-sm hover:underline"
        >
          Need help?
        </Link>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="basis-96">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 font-semibold">
              <span>Subtotal: {formatCurrency(order.total)}</span>
              <Badge
                className={cn(
                  "bg-secondary text-secondary-foreground",
                  order.paymentStatus === "failed" && "bg-red-500 text-white",
                  order.paymentStatus === "paid" && "bg-green-500 text-white",
                )}
              >
                {paymentStatusMap[order.paymentStatus] || order.paymentStatus}
              </Badge>
            </div>
            <div className="font-semibold">
              {orderStatusMap[order.orderStatus] || order.orderStatus}
            </div>
          </div>
          <div className="divide-y">
            {order.items?.map((item) => (
              <OrderItem key={`${item.productId}-${item.sku}`} item={item} />
            ))}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="font-semibold">Delivery address:</div>
          <p>{order.customerName}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
          <p>{order.address}</p>
          <p>{order.city}</p>
        </div>
      </div>
    </div>
  );
}

interface OrderItemProps {
  item: NonNullable<StorefrontOrder["items"]>[number];
}

function OrderItem({ item }: OrderItemProps) {
  return (
    <div className="flex flex-wrap gap-3 py-5 last:pb-0">
      {item.image && (
        <ProductImage
          src={item.image}
          width={110}
          height={110}
          alt={item.title || "Product image"}
          className="size-full object-cover flex-none bg-secondary"
        />
      )}
      <div className="space-y-0.5">
        <p className="line-clamp-1 font-bold">{item.title}</p>
        <p>
          {item.quantity} x {formatCurrency(item.price)}
        </p>
      </div>
    </div>
  );
}
