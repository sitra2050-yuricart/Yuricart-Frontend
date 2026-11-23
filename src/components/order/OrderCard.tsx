"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate } from "date-fns";
import ProductImage from "@/components/ProductImage";
import { OrderStatusPill } from "@/components/order/status";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/lib/api/types";

const MAX_THUMBS = 3;

/** One row in "Your orders": small, scannable, one tap to the full order. */
export default function OrderCard({ order }: { order: Order }) {
  const items = order.items ?? [];
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const first = items[0];
  const extra = items.length - 1;
  const href = `/checkout-success?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.email)}`;

  return (
    <article className="rounded-2xl bg-white ring-1 ring-gray-900/10 transition hover:ring-primary/30">
      <Link
        href={href}
        className="group flex flex-col gap-3 rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-baseline gap-3">
            <h3 className="text-base font-bold text-gray-900">#{order.orderNumber}</h3>
            {order.createdAt ? (
              <span className="text-sm text-gray-600">{formatDate(new Date(order.createdAt), "d MMM yyyy")}</span>
            ) : null}
          </div>
          <OrderStatusPill status={order.orderStatus} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex shrink-0 -space-x-3" aria-hidden>
            {items.slice(0, MAX_THUMBS).map((item, index) => (
              <span
                key={`${item.productId}-${index}`}
                className="size-12 overflow-hidden rounded-xl bg-brand-soft ring-2 ring-white sm:size-14"
              >
                {item.image ? (
                  <ProductImage
                    src={item.image}
                    width={56}
                    height={56}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </span>
            ))}
            {items.length > MAX_THUMBS ? (
              <span className="flex size-12 items-center justify-center rounded-xl bg-gray-100 sm:size-14 text-xs font-semibold text-gray-700 ring-2 ring-white">
                +{items.length - MAX_THUMBS}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 basis-40">
            <p className="line-clamp-1 text-sm font-semibold text-gray-900">{first?.title ?? "Your order"}</p>
            <p className="text-sm text-gray-600">
              {extra > 0 ? `and ${extra} more · ` : ""}
              {units} {units === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="ml-auto shrink-0 text-right">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-base font-bold text-gray-900">{formatCurrency(order.total)}</p>
          </div>
          <ChevronRight
            className="hidden size-5 shrink-0 text-gray-500 transition group-hover:translate-x-0.5 group-hover:text-primary sm:block"
            aria-hidden
          />
        </div>
        <span className="sr-only">View order {order.orderNumber}</span>
      </Link>
    </article>
  );
}
