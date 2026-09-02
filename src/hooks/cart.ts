"use client";

import { LegacyCart, useCartStore } from "@/lib/cart/cart-store";
import { Product } from "@/lib/api/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useToast } from "./use-toast";
import { getProductEffectivePrice } from "@/lib/api/product-utils";
import { trackAddToCart } from "@/lib/metaPixel";

const queryKey = ["cart"];

export function useCart(_initialData?: LegacyCart | null) {
  const items = useCartStore((s) => s.items);
  const getLegacyCart = useCartStore((s) => s.getLegacyCart);

  const data = useMemo(() => getLegacyCart(), [items, getLegacyCart]);

  return {
    data,
    isPending: false,
    isFetching: false,
    error: null as Error | null,
    refetch: async () => ({ data: getLegacyCart() }),
  };
}

export function useAddItemToCart() {
  const queryClient = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: {
      product: Product;
      selectedOptions: Record<string, string>;
      quantity: number;
    }) => {
      addItem(values);
      return Promise.resolve(useCartStore.getState().getLegacyCart());
    },
    onSuccess(data, variables) {
      const unitPrice = getProductEffectivePrice(variables.product);
      trackAddToCart({
        content_ids: [variables.product._id],
        content_name: variables.product.title,
        content_type: "product",
        contents: [
          {
            id: variables.product._id,
            quantity: variables.quantity,
            item_price: unitPrice,
          },
        ],
        value: unitPrice * variables.quantity,
        currency: variables.product.currency || "KES",
        num_items: variables.quantity,
      });
      toast({ description: "Item added to cart" });
      queryClient.setQueryData(queryKey, data);
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to add item to cart. Please try again.",
      });
    },
  });
}

export function useUpdateCartItemQuantity() {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (values: { productId: string; newQuantity: number }) => {
      updateQuantity(values.productId, values.newQuantity);
      return Promise.resolve(useCartStore.getState().getLegacyCart());
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });
}

export function useRemoveCartItem() {
  const removeItem = useCartStore((s) => s.removeItem);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) => {
      removeItem(productId);
      return Promise.resolve(useCartStore.getState().getLegacyCart());
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });
}

export function useClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: () => {
      clearCart();
      return Promise.resolve(null);
    },
  });
}
