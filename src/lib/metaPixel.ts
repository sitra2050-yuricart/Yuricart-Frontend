/**
 * Meta (Facebook) Pixel tracking helpers.
 *
 * Events are queued until `window.fbq` is available so clicks that happen
 * before the pixel script finishes loading are not dropped.
 *
 * Example:
 *
 *   import { trackAddToCart } from "@/lib/metaPixel";
 *
 *   trackAddToCart({
 *     content_ids: ["123"],
 *     content_name: "Nike Shoes",
 *     value: 49.99,
 *     currency: "USD",
 *   });
 */

export type MetaPixelEventData = {
  content_ids?: string[];
  content_id?: string;
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  status?: boolean | string;
  order_id?: string;
  [key: string]: unknown;
};

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type QueuedEvent = {
  eventName: string;
  data?: MetaPixelEventData;
  custom: boolean;
};

const eventQueue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

/** True when a Pixel ID is configured and we are in the browser. */
export function isMetaPixelEnabled(): boolean {
  return Boolean(PIXEL_ID) && typeof window !== "undefined";
}

function hasFbq(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function flushQueue(): void {
  if (!hasFbq()) return;

  while (eventQueue.length > 0) {
    const next = eventQueue.shift();
    if (!next) break;
    fire(next.eventName, next.data, next.custom);
  }

  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

function scheduleFlush(): void {
  if (flushTimer || typeof window === "undefined") return;

  const startedAt = Date.now();
  flushTimer = setInterval(() => {
    if (hasFbq()) {
      flushQueue();
      return;
    }

    // Give up after 10s so we do not poll forever (e.g. blocked by ad blocker).
    if (Date.now() - startedAt > 10_000) {
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      eventQueue.length = 0;
    }
  }, 100);
}

function fire(
  eventName: string,
  data?: MetaPixelEventData,
  custom = false,
): void {
  if (custom) {
    window.fbq!("trackCustom", eventName, data);
  } else {
    window.fbq!("track", eventName, data);
  }
}

function track(
  eventName: string,
  data?: MetaPixelEventData,
  custom = false,
): void {
  if (!PIXEL_ID || typeof window === "undefined") return;

  if (!hasFbq()) {
    eventQueue.push({ eventName, data, custom });
    scheduleFlush();
    return;
  }

  flushQueue();
  fire(eventName, data, custom);
}

/** Standard PageView (also fired automatically on route changes). */
export function pageView(): void {
  track("PageView");
}

/** Call on product detail views (PDP). */
export function trackViewContent(data?: MetaPixelEventData): void {
  track("ViewContent", data);
}

/** Call after a successful add-to-cart. */
export function trackAddToCart(data?: MetaPixelEventData): void {
  track("AddToCart", data);
}

/** Call when checkout starts. */
export function trackInitiateCheckout(data?: MetaPixelEventData): void {
  track("InitiateCheckout", data);
}

/** Call when payment info is submitted / payment method confirmed. */
export function trackAddPaymentInfo(data?: MetaPixelEventData): void {
  track("AddPaymentInfo", data);
}

/** Call once per successful purchase. */
export function trackPurchase(data?: MetaPixelEventData): void {
  track("Purchase", data);
}

/** Call for lead actions (WhatsApp, contact, etc.). */
export function trackLead(data?: MetaPixelEventData): void {
  track("Lead", data);
}

/** Call after successful account registration. */
export function trackCompleteRegistration(data?: MetaPixelEventData): void {
  track("CompleteRegistration", data);
}

/** Call when a search is submitted. */
export function trackSearch(data?: MetaPixelEventData): void {
  track("Search", data);
}

/** Fire a custom event from Events Manager. */
export function trackCustom(
  eventName: string,
  data?: MetaPixelEventData,
): void {
  track(eventName, data, true);
}

export function getMetaPixelId(): string | undefined {
  return PIXEL_ID || undefined;
}
