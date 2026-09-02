"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./use-toast";
import { Product } from "@/lib/api/types";
import { useCartStore } from "@/lib/cart/cart-store";
import { getProductEffectivePrice } from "@/lib/api/product-utils";
import {
  trackAddToCart,
  trackInitiateCheckout,
} from "@/lib/metaPixel";

export function useCartCheckout() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  async function startCheckoutFlow() {
    if (!items.length) {
      toast({
        variant: "destructive",
        description: "Your cart is empty.",
      });
      return;
    }

    trackInitiateCheckout({
      content_ids: items.map((item) => item.productId),
      contents: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.salePrice ?? item.price,
      })),
      value: subtotal,
      currency: items[0]?.currency || "KES",
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      content_type: "product",
    });

    setPending(true);
    router.push("/checkout");
    setPending(false);
  }

  return { startCheckoutFlow, pending };
}

export function useQuickBuy() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);

  async function startCheckoutFlow(values: {
    product: Product;
    selectedOptions: Record<string, string>;
    quantity: number;
  }) {
    setPending(true);
    try {
      const unitPrice = getProductEffectivePrice(values.product);
      const value = unitPrice * values.quantity;
      const currency = values.product.currency || "KES";

      trackAddToCart({
        content_ids: [values.product._id],
        content_name: values.product.title,
        content_type: "product",
        contents: [
          {
            id: values.product._id,
            quantity: values.quantity,
            item_price: unitPrice,
          },
        ],
        value,
        currency,
        num_items: values.quantity,
      });

      trackInitiateCheckout({
        content_ids: [values.product._id],
        content_name: values.product.title,
        content_type: "product",
        contents: [
          {
            id: values.product._id,
            quantity: values.quantity,
            item_price: unitPrice,
          },
        ],
        value,
        currency,
        num_items: values.quantity,
      });

      clearCart();
      addItem(values);
      router.push("/checkout");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to start checkout. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return { startCheckoutFlow, pending };
}
