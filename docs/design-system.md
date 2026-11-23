# Design system

One place for the rules, so new pages stay consistent. Tokens live in `src/app/globals.css` and are exposed as Tailwind colours in `tailwind.config.ts`. Use the token, never a hex value.

## Colour

| Token | Value | Use | Contrast |
|---|---|---|---|
| `primary` | `#003B73` navy | Header, buttons, links, focus ring, selected chips | 11.2:1 with white |
| `cta` | `#C2410C` orange | Conversion accents only: discount pills, Buy now, the Offers link, cart count badge, page title accent bar | 5.2:1 with white, and as text on white |
| `brand-soft` | `#eef3f9` | Icon wells, placeholder tiles, soft panels | navy on it is 10:1 |
| `surface` | `#f7f8fa` | Page and footer background | grey-600 on it is above 6:1 |
| `whatsapp` | `#1a7f43` | WhatsApp buttons | 5:1 with white |
| `muted-foreground` | `#4b5563` | Secondary text | 7:1 on white |

Rules:
- Navy is structure and the default action. Orange is for the one thing we want people to do (buy) and for savings. Do not use orange for body text, borders or large surfaces.
- Small text must reach 4.5:1. Do not use grey lighter than `gray-500` for text, including placeholders and struck-through prices.
- Opacity modifiers work on all of these (`bg-primary/90`, `ring-primary/25`).

## Type

One family: Source Sans 3 (`font-sans`). There is no serif. Headings use weight and size, not a second font.

## Shape

`--radius` is 0.75rem, so shadcn components (`rounded-lg`, `rounded-md`) are rounded to match the storefront. Cards use `rounded-2xl`, pills and buttons `rounded-full`.

## Light only

The pages are designed light. The theme is forced to light and there is no theme switcher.

## Checks

`npm run test:e2e` fails on any serious accessibility violation (including colour contrast) on the main pages, and on any border or focus ring that a scroll container clips.
