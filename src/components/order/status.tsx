import { cn } from "@/lib/utils";
import type { Order } from "@/lib/api/types";

export const ORDER_STATUS_LABEL: Record<Order["orderStatus"], string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  processing: "Being prepared",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<Order["paymentStatus"], string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "Pay on delivery",
  mpesa: "M-Pesa",
  whatsapp: "Pay via WhatsApp",
  card: "Card",
};

const ORDER_TONE: Record<Order["orderStatus"], string> = {
  pending: "bg-amber-50 text-amber-900 ring-amber-200",
  confirmed: "bg-brand-soft text-primary ring-primary/20",
  processing: "bg-brand-soft text-primary ring-primary/20",
  shipped: "bg-primary text-white ring-primary",
  delivered: "bg-green-50 text-green-900 ring-green-200",
  cancelled: "bg-red-50 text-red-800 ring-red-200",
};

const PAYMENT_TONE: Record<Order["paymentStatus"], string> = {
  pending: "bg-gray-100 text-gray-800 ring-gray-200",
  paid: "bg-green-50 text-green-900 ring-green-200",
  failed: "bg-red-50 text-red-800 ring-red-200",
  refunded: "bg-gray-100 text-gray-800 ring-gray-200",
};

const PILL = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1";

export function OrderStatusPill({ status }: { status: Order["orderStatus"] }) {
  return <span className={cn(PILL, ORDER_TONE[status])}>{ORDER_STATUS_LABEL[status] ?? status}</span>;
}

export function PaymentStatusPill({ status }: { status: Order["paymentStatus"] }) {
  return <span className={cn(PILL, PAYMENT_TONE[status])}>{PAYMENT_STATUS_LABEL[status] ?? status}</span>;
}
