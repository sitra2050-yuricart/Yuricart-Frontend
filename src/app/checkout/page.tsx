"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, FormError, SubmitButton } from "@/components/auth/Field";
import { useCartStore } from "@/lib/cart/cart-store";
import { createOrder } from "@/lib/api/orders";
import { getCustomerToken } from "@/lib/api/auth";
import { formatCurrency } from "@/lib/utils";
import { getUnitPrice } from "@/lib/api/product-utils";
import { StorefrontApiError } from "@/lib/api/client";
import { isValidKenyanPhone } from "@/lib/phone";
import { useClearCart } from "@/hooks/cart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackAddPaymentInfo, trackPurchase } from "@/lib/metaPixel";

type PaymentMethod = "cod" | "whatsapp" | "mpesa";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCartMutation = useClearCart();
  const [pending, setPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!items.length) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!isValidKenyanPhone(form.phone)) {
      setPhoneError("Enter a Kenyan mobile number, like 0712 345 678.");
      return;
    }
    setPhoneError("");

    setPending(true);

    try {
      trackAddPaymentInfo({
        content_ids: items.map((item) => item.productId),
        value: subtotal,
        currency: items[0]?.currency || "KES",
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      const order = await createOrder(
        {
          ...form,
          county: "Kenya",
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            options: item.options,
          })),
        },
        getCustomerToken(),
      );

      trackPurchase({
        content_ids: items.map((item) => item.productId),
        contents: items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: getUnitPrice(item),
        })),
        value: order.total ?? subtotal,
        currency: items[0]?.currency || "KES",
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        content_type: "product",
        order_id: order.orderNumber,
      });

      clearCartMutation.mutate();
      router.push(
        `/checkout-success?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(form.email)}`,
      );
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof StorefrontApiError && error.message
          ? error.message
          : "We couldn't place your order. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Link
          href="/shop"
          className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/15 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Continue shopping
        </Link>
      </div>

      <section
        aria-labelledby="order-summary"
        className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-900/5"
      >
        <h2 id="order-summary" className="text-lg font-semibold">
          Order summary
        </h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.lineId} className="flex justify-between gap-4">
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>
                {formatCurrency(
                  getUnitPrice(item) * item.quantity,
                  item.currency,
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="font-bold">Subtotal: {formatCurrency(subtotal)}</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={formError} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Full name"
              name="customerName"
              autoComplete="name"
              required
              value={form.customerName}
              onChange={set("customerName")}
            />
          </div>
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={set("email")}
          />
          <Field
            label="Phone (WhatsApp)"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="0712 345 678"
            required
            error={phoneError}
            value={form.phone}
            onChange={set("phone")}
          />
          <div className="sm:col-span-2">
            <Field
              label="Delivery address"
              name="address"
              autoComplete="street-address"
              required
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <Field
            label="City"
            name="city"
            autoComplete="address-level2"
            required
            value={form.city}
            onChange={set("city")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="payment-method" className="text-sm font-medium text-gray-800">
            Payment method
          </label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
          >
            <SelectTrigger id="payment-method" className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="whatsapp">WhatsApp Order</SelectItem>
              <SelectItem value="mpesa">M-Pesa (after order)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SubmitButton pending={pending}>Place order</SubmitButton>
      </form>
    </main>
  );
}
