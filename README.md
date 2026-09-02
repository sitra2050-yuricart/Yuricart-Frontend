This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Meta (Facebook) Pixel

Set your Pixel ID in `.env` (never hardcode it):

```env
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here
```

If this variable is missing, the pixel script and all tracking helpers are no-ops.

The pixel is loaded once from the root layout via `src/components/MetaPixel.tsx` (`next/script`). `PageView` fires on the initial load and on every App Router client-side navigation.

### Tracking helpers

Import from `@/lib/metaPixel` and call from client components / event handlers only:

```ts
import { trackAddToCart } from "@/lib/metaPixel";

trackAddToCart({
  content_ids: ["123"],
  content_name: "Nike Shoes",
  value: 49.99,
  currency: "USD",
});
```

Available helpers:

| Helper | Meta event |
| --- | --- |
| `pageView()` | PageView (usually automatic) |
| `trackViewContent(data?)` | ViewContent |
| `trackAddToCart(data?)` | AddToCart |
| `trackInitiateCheckout(data?)` | InitiateCheckout |
| `trackAddPaymentInfo(data?)` | AddPaymentInfo |
| `trackPurchase(data?)` | Purchase |
| `trackLead(data?)` | Lead |
| `trackCompleteRegistration(data?)` | CompleteRegistration |
| `trackSearch(data?)` | Search |
| `trackCustom(eventName, data?)` | Custom event |

All helpers check `window.fbq` and the Pixel ID before calling, so they are SSR-safe.

### Production checklist

1. Set `NEXT_PUBLIC_META_PIXEL_ID` in your host (e.g. Vercel → Project → Settings → Environment Variables). `.env` is gitignored and is **not** deployed with `git push`.
2. Redeploy after adding/changing any `NEXT_PUBLIC_*` variable (they are baked in at build time).
3. Verify in Meta Events Manager → **Test events** (real-time). The Overview charts can lag by minutes or hours.
4. Disable ad blockers when testing; they often block `fbevents.js`.
5. In the browser console on your site, run `typeof fbq` — it should print `"function"`.
