import { trackOrder } from "@/lib/api/orders";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClearCart from "./ClearCart";
import Order from "@/components/Order";
import MpesaPayment from "@/components/ui/MpesaPayment";
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

export default async function Page({ searchParams }: PageProps) {
  const { orderNumber, email } = await searchParams;

  if (!orderNumber || !email) {
    notFound();
  }

  const order = await trackOrder(orderNumber, email);

  if (!order) {
    notFound();
  }

  const orderCreatedDate = order.createdAt ? new Date(order.createdAt) : null;

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center space-y-5 px-5 py-10">
      <h1 className="text-3xl font-bold">We received your order!</h1>
      <p>A summary of your order was sent to your email address.</p>

      <h2 className="text-2xl font-bold">Order details</h2>
      <Order order={order} />

      <Link href="/profile" className="block text-primary hover:underline">
        View all your orders
      </Link>

      {orderCreatedDate &&
        orderCreatedDate.getTime() > Date.now() - 60_000 * 5 && <ClearCart />}
      {order.paymentMethod === "mpesa" && <MpesaPayment order={order} />}
    </main>
  );
}
