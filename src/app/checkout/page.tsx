"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/LoadingButton";
import { useCartStore } from "@/lib/cart/cart-store";
import { createOrder } from "@/lib/api/orders";
import { getCustomerToken } from "@/lib/api/auth";
import { formatCurrency } from "@/lib/utils";
import { useClearCart } from "@/hooks/cart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  trackAddPaymentInfo,
  trackPurchase,
} from "@/lib/metaPixel";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCartMutation = useClearCart();
  const [pending, setPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "whatsapp" | "mpesa">("cod");

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  if (!items.length) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-6" asChild>
          <a href="/shop">Continue shopping</a>
        </Button>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          item_price: item.salePrice ?? item.price,
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
      alert("Failed to place order. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Button variant="outline" asChild>
          <a href="/shop">Continue Shopping</a>
        </Button>
      </div>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.lineId} className="flex justify-between gap-4">
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>
                {formatCurrency(
                  (item.salePrice ?? item.price) * item.quantity,
                  item.currency,
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="font-bold">Subtotal: {formatCurrency(subtotal)}</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="customerName">Full name</Label>
            <Input
              id="customerName"
              required
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (WhatsApp)</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Delivery address</Label>
            <Input
              id="address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Payment method</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) =>
              setPaymentMethod(v as "cod" | "whatsapp" | "mpesa")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="whatsapp">WhatsApp Order</SelectItem>
              <SelectItem value="mpesa">M-Pesa (after order)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <LoadingButton type="submit" loading={pending} size="lg" className="w-full">
          Place order
        </LoadingButton>
      </form>
    </main>
  );
}
