"use client";

import { MapPin, CreditCard } from "lucide-react";
import ProductImage from "./ProductImage";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_METHOD_LABEL, PaymentStatusPill } from "@/components/order/status";
import type { Order as StorefrontOrder } from "@/lib/api/types";

interface OrderProps {
  order: StorefrontOrder;
}

/** Full order: what was bought, what it costs, and where it is going. */
export default function Order({ order }: OrderProps) {
  const items = order.items ?? [];
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const place = [order.city, order.county].filter(Boolean).join(", ");

  return (
    <div className="grid w-full gap-5 text-left lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section
        aria-label="Items"
        className="rounded-2xl bg-white p-5 ring-1 ring-gray-900/10 sm:p-6"
      >
        <h3 className="text-base font-bold text-gray-900">
          Items <span className="font-medium text-gray-600">({units})</span>
        </h3>
        <ul className="mt-3 divide-y divide-gray-100">
          {items.map((item, index) => (
            <li key={`${item.productId}-${item.sku ?? index}`} className="flex gap-4 py-4 first:pt-2">
              <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-brand-soft ring-1 ring-gray-900/5">
                {item.image ? (
                  <ProductImage
                    src={item.image}
                    width={64}
                    height={64}
                    alt={item.title || "Product image"}
                    className="size-full object-cover"
                  />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-0.5 text-sm text-gray-600">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-2 space-y-2 border-t border-gray-100 pt-4 text-sm">
          {order.subtotal > 0 && order.subtotal !== order.total ? (
            <div className="flex justify-between text-gray-700">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.subtotal)}</dd>
            </div>
          ) : null}
          {order.discount > 0 ? (
            <div className="flex justify-between text-green-800">
              <dt>Discount</dt>
              <dd>−{formatCurrency(order.discount)}</dd>
            </div>
          ) : null}
          {order.shipping > 0 ? (
            <div className="flex justify-between text-gray-700">
              <dt>Delivery</dt>
              <dd>{formatCurrency(order.shipping)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
            <dt>Total</dt>
            <dd>{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="space-y-5">
        <section aria-label="Delivery" className="rounded-2xl bg-white p-5 ring-1 ring-gray-900/10 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <MapPin className="size-4 text-primary" aria-hidden />
            Delivery to
          </h3>
          <address className="mt-3 space-y-0.5 text-sm not-italic text-gray-700">
            <p className="font-semibold text-gray-900">{order.customerName}</p>
            {order.address ? <p>{order.address}</p> : null}
            {place ? <p>{place}</p> : null}
            <p className="pt-1">{order.phone}</p>
            <p className="break-all">{order.email}</p>
          </address>
        </section>

        <section aria-label="Payment" className="rounded-2xl bg-white p-5 ring-1 ring-gray-900/10 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <CreditCard className="size-4 text-primary" aria-hidden />
            Payment
          </h3>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-700">
              {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
            </span>
            <PaymentStatusPill status={order.paymentStatus} />
          </div>
        </section>
      </div>
    </div>
  );
}
