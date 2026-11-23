"use client";

import { MessageCircle } from "lucide-react";
import { useWhatsAppNumber } from "@/components/WhatsAppSettingsProvider";
import type { Order } from "@/lib/api/types";

/**
 * M-Pesa and WhatsApp orders are paid by hand: we send the payment details on
 * WhatsApp and confirm the order when payment arrives. Say so plainly instead
 * of implying an automatic payment.
 */
export default function ManualPaymentNotice({ order }: { order: Order }) {
  const digits = useWhatsAppNumber().replace(/\D/g, "");
  const method = order.paymentMethod === "mpesa" ? "M-Pesa" : "WhatsApp";
  const text = `Hi, I placed order ${order.orderNumber} and want to pay with ${method}.`;

  return (
    <section
      aria-labelledby="payment-next"
      className="w-full space-y-3 rounded-2xl bg-brand-soft p-5 text-left ring-1 ring-primary/15"
    >
      <h2 id="payment-next" className="text-lg font-bold text-gray-900">
        Next: pay with {method}
      </h2>
      <p className="text-gray-700">
        We will send you the payment details on WhatsApp. Your order is confirmed once we receive
        the payment. Quote order number <strong>{order.orderNumber}</strong>.
      </p>
      <a
        href={`https://wa.me/${digits}?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-white transition hover:bg-whatsapp/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
      >
        <MessageCircle className="size-4" aria-hidden />
        Message us on WhatsApp
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}
