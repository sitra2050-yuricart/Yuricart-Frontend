"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart/cart-store";

/**
 * Returns true only after zustand persist has rehydrated from localStorage.
 * Use to keep SSR cart badges at 0 and avoid React hydration #418 mismatches.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsub;
  }, []);

  return hydrated;
}
