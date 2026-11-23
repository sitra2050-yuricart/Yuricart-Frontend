/**
 * Shared look for the product page. Kept in /components so Tailwind's content
 * globs pick the classes up. Brand: navy #003B73 + the theme's orange (primary).
 */

/** White surface with a hairline ring and a soft, layered shadow. */
export const CARD =
  "rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-14px_rgba(16,24,40,0.16)]";

/** Section heading with the little orange accent bar. */
export const SECTION_TITLE =
  "flex items-center gap-2.5 font-serif text-lg font-bold tracking-tight text-gray-900";

/** Small outlined pill button (navy on hover). */
export const PILL_BUTTON =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#003B73] hover:text-[#003B73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]/40";

/** Primary action buttons in the buy box. */
export const BUY_BUTTON =
  "h-12 flex-1 justify-center gap-2 rounded-xl text-[15px] font-semibold text-white shadow-sm transition active:scale-[0.98] md:h-12 md:w-full md:flex-none";
