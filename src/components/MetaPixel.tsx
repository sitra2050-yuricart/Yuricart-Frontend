"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getMetaPixelId, pageView } from "@/lib/metaPixel";

/**
 * Fires PageView on client-side App Router navigations.
 * Skips the first run because the base pixel script already tracks PageView on init.
 */
function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialPath = useRef(true);

  useEffect(() => {
    if (!getMetaPixelId()) return;

    if (isInitialPath.current) {
      isInitialPath.current = false;
      return;
    }

    pageView();
  }, [pathname, searchParams]);

  return null;
}

/** Client-only route-change PageView tracker. Pixel init Script lives in root layout. */
export default function MetaPixel() {
  if (!getMetaPixelId()) return null;

  return (
    <Suspense fallback={null}>
      <MetaPixelRouteTracker />
    </Suspense>
  );
}
