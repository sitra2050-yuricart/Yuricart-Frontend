/**
 * Global TypeScript declarations for the Meta (Facebook) Pixel `fbq` API.
 * Loaded via next/script in MetaPixel; available on window after init.
 */

type FbqEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Search"
  | (string & {});

interface Fbq {
  (command: "init", pixelId: string, userData?: Record<string, unknown>): void;
  (
    command: "track" | "trackCustom",
    eventName: FbqEventName,
    data?: Record<string, unknown>,
    eventData?: Record<string, unknown>,
  ): void;
  (
    command: "trackSingle" | "trackSingleCustom",
    pixelId: string,
    eventName: FbqEventName,
    data?: Record<string, unknown>,
  ): void;
  (command: string, ...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
}

interface Window {
  fbq?: Fbq;
  _fbq?: Fbq;
}

declare const fbq: Fbq;
