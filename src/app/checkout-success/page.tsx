import { trackOrder } from "@/lib/api/orders";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "date-fns";
import { Check, MessageCircle, PackageCheck, Truck } from "lucide-react";
import ClearCart from "./ClearCart";
import Order from "@/components/Order";
import ManualPaymentNotice from "@/components/ManualPaymentNotice";
import { buildPageMetadata } from "@/lib/seo";

interface PageProps {
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
}

export const metadata: Metadata = buildPageMetadata({
  title: "Order confirmation",
  description: "Your Yuricart order confirmation.",
  path: "/checkout-success",
  noIndex: true,
});

const NEXT_STEPS = [
  { icon: MessageCircle, title: "We contact you", text: "We confirm your order and the delivery time by phone or WhatsApp." },
  { icon: PackageCheck, title: "We prepare it", text: "Your items are checked and packed." },
  { icon: Truck, title: "It is delivered", text: "You pay as agreed and receive your order." },
];

export default async function Page({ searchParams }: PageProps) {
  const { orderNumber, email } = await searchParams;

  if (!orderNumber || !email) {
    notFound();
  }

  const order = await trackOrder(orderNumber, { email });

  if (!order) {
    notFound();
  }

  const orderCreatedDate = order.createdAt ? new Date(order.createdAt) : null;
  const firstName = order.customerName?.trim().split(/\s+/)[0];
  const manualPayment = order.paymentMethod === "mpesa" || order.paymentMethod === "whatsapp";

  return (
    <main className="bg-surface">
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:py-12">
        <header className="rounded-2xl bg-white p-6 text-center ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700 ring-8 ring-green-50/60">
            <Check className="size-7" strokeWidth={3} aria-hidden />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            We received your order!
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-gray-700">
            {firstName ? `Thank you, ${firstName}. ` : "Thank you. "}
            A confirmation with the details was sent to <strong className="break-all">{order.email}</strong>.
          </p>
          <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-brand-soft px-5 py-2 text-sm text-primary">
            <span>
              Order <strong className="font-bold">#{order.orderNumber}</strong>
            </span>
            {orderCreatedDate ? (
              <>
                <span aria-hidden className="text-primary/40">|</span>
                <span>{formatDate(orderCreatedDate, "d MMM yyyy")}</span>
              </>
            ) : null}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/track"
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Track your order
            </Link>
            <Link
              href="/profile#orders"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/15 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View all your orders
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Continue shopping
            </Link>
          </div>
        </header>

        {manualPayment ? <ManualPaymentNotice order={order} /> : null}

        <section aria-labelledby="next-steps" className="space-y-3">
          <h2 id="next-steps" className="text-lg font-bold text-gray-900">
            What happens next
          </h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {NEXT_STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-900/10">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {index + 1}. {title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-700">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="order-details" className="space-y-3">
          <h2 id="order-details" className="text-lg font-bold text-gray-900">
            Order details
          </h2>
          <Order order={order} />
        </section>

        {orderCreatedDate && orderCreatedDate.getTime() > Date.now() - 60_000 * 5 && <ClearCart />}
      </div>
    </main>
  );
}
