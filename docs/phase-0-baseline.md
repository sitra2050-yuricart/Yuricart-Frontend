# Phase 0 baseline (23 Nov 2026)

Measured on the live site before any Phase 1 to 5 change. Lighthouse 12.2.1, mobile profile, headless Chrome from a developer laptop, so absolute timings vary run to run. Use these for direction, not as a contract.

## Lighthouse (live, mobile)

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home | 41 | 96 | 79 | 100 | 1.6 s | 7.8 s | 3,470 ms | 0 |
| Shop | 57 | 95 | 79 | 100 | 1.2 s | 6.4 s | 850 ms | 0 |
| Product (HP EliteBook 1030 G4) | not scored | 97 | 79 | 100 | 2.0 s | no LCP detected | n/a | 0 |

Targets (plan): Performance 80+, LCP under 2.5 s, CLS under 0.1, Accessibility 95+, SEO 100.

Notes:
- The product page returned no LCP, so Lighthouse could not score performance. The main image was failing at the time (Vercel image optimizer 402, fixed in the image loader PR); re-measure after that deploy.
- Lighthouse SEO is 100 even though the canonical host is wrong. Its canonical check accepts any valid URL, so it does not replace the E2E canonical test.
- Failing audits: colour contrast (home, shop), heading order (shop).

## Automated suite (mock API, local production build)

| Check | Result |
|---|---|
| Status 200, exactly one H1, canonical on www.yuricart.com, no console errors (shop, categories, collection, product) | Pass |
| `/sitemap.xml` and `/robots.txt` use the real host | Pass (after the base-URL fix) |
| Axe serious or critical, excluding colour contrast | Pass |
| Axe colour contrast | Fails on every page (allowlisted until Phase 2) |
| Homepage shows no bare error when the API is down | Not implemented (`fixme`, Phase 1) |

Colour contrast offenders: white on orange `#f97316` 2.8:1 (discount pills, buy button), white on WhatsApp green 1.98:1 and 3.09:1, grey struck-through price 2.53:1 (fixed), category initials on pale blue.

## Live-site findings from the audit

- Canonical, `og:url` and the `robots.txt` sitemap line point at `yuricart-frontend-chi.vercel.app`.
- `/sitemap.xml` is 404.
- Missing pages (404): `/register`, `/forgot-password`, `/account`, `/orders`, `/track`, `/offers`, `/about`, `/contact`, `/warranty`, `/returns`, `/delivery`, `/privacy`, `/faq`, `/how-to-buy`.
- Homepage: hero blank while loading, only Organization and WebSite JSON-LD, no skeletons.
