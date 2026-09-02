"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/lib/api/types";
import {
  getProductEffectivePrice,
  getProductImageUrl,
} from "@/lib/api/product-utils";

export interface LegacyCartLineItem {
  _id: string;
  quantity?: number;
  url?: string;
  image?: string;
  productName?: { translated?: string };
  descriptionLines?: Array<{
    colorInfo?: { translated?: string };
    plainText?: { translated?: string };
  }>;
  price?: { formattedConvertedAmount?: string; amount?: number };
  fullPrice?: { formattedConvertedAmount?: string; amount?: number };
  availability?: { quantityAvailable?: number };
}

export interface LegacyCart {
  lineItems?: LegacyCartLineItem[];
  subtotal?: { formattedConvertedAmount?: string; amount?: number };
}

function lineId(productId: string, options?: Record<string, string>) {
  const opts = options
    ? Object.entries(options)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("|")
    : "";
  return opts ? `${productId}__${opts}` : productId;
}

function formatLinePrice(amount: number, currency = "KES") {
  return Intl.NumberFormat("en", { style: "currency", currency }).format(
    amount,
  );
}

function toLegacyLine(item: CartItem): LegacyCartLineItem {
  const unitPrice = item.salePrice ?? item.price;
  return {
    _id: item.lineId,
    quantity: item.quantity,
    url: `/products/${item.slug}`,
    image: item.image,
    productName: { translated: item.title },
    descriptionLines: item.options
      ? Object.entries(item.options).map(([key, value]) => ({
          plainText: { translated: `${key}: ${value}` },
        }))
      : [],
    price: {
      amount: unitPrice,
      formattedConvertedAmount: formatLinePrice(unitPrice, item.currency),
    },
    fullPrice:
      item.salePrice && item.salePrice < item.price
        ? {
            amount: item.price,
            formattedConvertedAmount: formatLinePrice(
              item.price,
              item.currency,
            ),
          }
        : undefined,
    availability: { quantityAvailable: item.stock },
  };
}

function computeSubtotal(items: CartItem[]) {
  const amount = items.reduce(
    (sum, item) => sum + (item.salePrice ?? item.price) * item.quantity,
    0,
  );
  const currency = items[0]?.currency || "KES";
  return {
    amount,
    formattedConvertedAmount: formatLinePrice(amount, currency),
  };
}

interface CartState {
  items: CartItem[];
  addItem: (params: {
    product: Product;
    quantity: number;
    selectedOptions?: Record<string, string>;
  }) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  getLegacyCart: () => LegacyCart;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: ({ product, quantity, selectedOptions }) => {
        const id = lineId(product._id, selectedOptions);
        const unitPrice = getProductEffectivePrice(product);
        const maxStock = product.stock ?? 0;
        const existing = get().items.find((i) => i.lineId === id);

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, maxStock);
          set({
            items: get().items.map((i) =>
              i.lineId === id
                ? { ...i, quantity: newQty }
                : i,
            ),
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              lineId: id,
              productId: product._id,
              slug: product.slug,
              title: product.title,
              image: getProductImageUrl(product),
              price: product.price,
              salePrice: unitPrice < product.price ? unitPrice : undefined,
              quantity: Math.min(quantity, maxStock),
              sku: product.sku,
              options: selectedOptions,
              currency: product.currency || "KES",
              stock: maxStock,
            },
          ],
        });
      },
      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.lineId !== lineId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.lineId === lineId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i,
          ),
        });
      },
      removeItem: (lineId) => {
        set({ items: get().items.filter((i) => i.lineId !== lineId) });
      },
      clearCart: () => set({ items: [] }),
      getLegacyCart: () => {
        const items = get().items;
        return {
          lineItems: items.map(toLegacyLine),
          subtotal: computeSubtotal(items),
        };
      },
      getSubtotal: () => computeSubtotal(get().items).amount,
    }),
    { name: "yuricart-cart" },
  ),
);
