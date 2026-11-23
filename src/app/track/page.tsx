"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Breadcrumb from "@/components/listing/Breadcrumb";
import Order from "@/components/Order";
import { Field, FormError, SubmitButton } from "@/components/auth/Field";
import { requestOrderNumbers, trackOrder } from "@/lib/api/orders";
import { StorefrontApiError } from "@/lib/api/client";
import type { Order as StorefrontOrder } from "@/lib/api/types";

const STEPS = [
  { key: "pending", label: "Order received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Being prepared" },
  { key: "shipped", label: "On its way" },
  { key: "delivered", label: "Delivered" },
] as const;

function Progress({ status }: { status: StorefrontOrder["orderStatus"] }) {
  if (status === "cancelled") {
    return (
      <p role="status" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200">
        This order was cancelled. Message us on WhatsApp if you have questions.
      </p>
    );
  }
  const current = Math.max(0, STEPS.findIndex((step) => step.key === status));

  return (
    <ol className="grid gap-3 sm:grid-cols-5" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step.key}
            aria-current={index === current ? "step" : undefined}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ${
              done ? "bg-brand-soft font-semibold text-primary ring-primary/20" : "bg-white text-gray-600 ring-gray-900/10"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                done ? "bg-primary text-white" : "bg-gray-200 text-transparent"
              }`}
              aria-hidden
            >
              <Check className="size-3" />
            </span>
            {step.label}
            {index === current ? <span className="sr-only"> (current step)</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<StorefrontOrder | null>(null);

  const [lostEmail, setLostEmail] = useState("");
  const [lostPending, setLostPending] = useState(false);
  const [lostMessage, setLostMessage] = useState("");

  // A link from an email carries the order number and a token: open the order straight away.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedOrder = params.get("orderNumber");
    const token = params.get("token");
    if (linkedOrder && token) {
      setOrderNumber(linkedOrder);
      void lookup(linkedOrder, { token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLost(e: React.FormEvent) {
    e.preventDefault();
    setLostPending(true);
    setLostMessage("");
    try {
      setLostMessage(await requestOrderNumbers(lostEmail.trim()));
    } catch {
      setLostMessage("We couldn't send that. Check your connection and try again.");
    } finally {
      setLostPending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void lookup(orderNumber.trim(), { email: email.trim() });
  }

  async function lookup(number: string, access: { email?: string; token?: string }) {
    setError("");
    setPending(true);
    try {
      setOrder(await trackOrder(number, access));
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof StorefrontApiError && err.status === 404
          ? "We could not find an order with that number and email. Check both and try again."
          : "We couldn't look that up. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Track your order" }]} />

      <section className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:p-8">
        <header className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Track your order
            </h1>
          </div>
          <p className="text-sm text-gray-700">
            Enter the order number from your confirmation and the email you ordered with.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormError message={error} />
          </div>
          <Field
            label="Order number"
            name="orderNumber"
            placeholder="YC-20261123-0001"
            autoComplete="off"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="sm:col-span-2">
            <SubmitButton pending={pending}>Track order</SubmitButton>
          </div>
        </form>
      </section>

      {order ? (
        <section aria-labelledby="order-result" className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-gray-900/5 sm:p-8">
          <h2 id="order-result" className="text-xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h2>
          <Progress status={order.orderStatus} />
          <Order order={order} />
          <p className="text-sm text-gray-700">
            Questions about this order?{" "}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </section>
      ) : null}

      <section aria-labelledby="lost-number" className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-gray-900/5 sm:p-8">
        <header className="space-y-1">
          <h2 id="lost-number" className="text-lg font-bold text-gray-900">
            Can&apos;t find your order?
          </h2>
          <p className="text-sm text-gray-700">
            Enter the email you ordered with and we will email you the orders placed with it, each with a link to track it.
          </p>
        </header>
        <form onSubmit={handleLost} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field
            label="Send the list to"
            type="email"
            name="lostEmail"
            autoComplete="email"
            required
            value={lostEmail}
            onChange={(e) => setLostEmail(e.target.value)}
          />
          <SubmitButton pending={lostPending}>Email me my orders</SubmitButton>
        </form>
        {lostMessage ? (
          <p role="status" className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-primary">
            {lostMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}
