"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { cn } from "@/lib/utils";
import type { CompareItem, RailItem, SpecRow } from "@/lib/product-specs";
import { CARD, SECTION_TITLE } from "./styles";

/* ------------------------------------------------------------------ */
/* Sticky section tabs (pill switcher)                                 */
/* ------------------------------------------------------------------ */

/** py-2 (16) + nav p-1 (8) + h-9 pills (36) */
const TABS_HEIGHT = 60;

function getHeaderHeight() {
  const header = document.querySelector("header");
  return header ? header.getBoundingClientRect().height : 0;
}

/**
 * Smooth-scrolls so the section sits just under the sticky header + tab bar.
 * Re-checks once afterwards: late-loading images in the description can shift
 * the layout while the smooth scroll is still running.
 */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  const targetY = () =>
    el.getBoundingClientRect().top +
    window.scrollY -
    getHeaderHeight() -
    TABS_HEIGHT -
    4;

  window.scrollTo({ top: targetY(), behavior: "smooth" });
  window.setTimeout(() => {
    if (Math.abs(window.scrollY - targetY()) > 4) {
      window.scrollTo({ top: targetY(), behavior: "auto" });
    }
  }, 1200);
  return true;
}

export function SectionTabs({
  tabs,
}: {
  tabs: Array<{ id: string; label: string }>;
}) {
  const [top, setTop] = useState(0);
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const update = () => setTop(getHeaderHeight());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const line = getHeaderHeight() + TABS_HEIGHT + 24;
      let current = tabs[0]?.id;
      for (const tab of tabs) {
        const el = document.getElementById(tab.id);
        if (el && el.getBoundingClientRect().top <= line) current = tab.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tabs]);

  return (
    <div
      className="sticky z-20 -mx-2 mt-5 bg-[#f6f7f9]/90 px-2 py-2 backdrop-blur md:mx-0 md:px-0"
      style={{ top }}
    >
      <nav
        aria-label="Product sections"
        className="flex items-center gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-900/5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToSection(tab.id)}
            aria-current={active === tab.id ? "true" : undefined}
            className={cn(
              "h-9 flex-none whitespace-nowrap rounded-full px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:flex-1 md:px-2",
              active === tab.id &&
                "bg-[#003B73] font-semibold text-white shadow-sm hover:bg-[#003B73] hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section card with accent-bar title                                  */
/* ------------------------------------------------------------------ */

export function SectionCard({
  id,
  title,
  action,
  children,
  className,
}: {
  id: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("my-5", className)}>
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 md:px-6">
          <h2 className={SECTION_TITLE}>
            <span
              aria-hidden="true"
              className="h-5 w-1 rounded-full bg-primary"
            />
            {title}
          </h2>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

export function Section(props: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return <SectionCard {...props} />;
}

/* ------------------------------------------------------------------ */
/* Collapsible block with fade + "Show more" pill                      */
/* ------------------------------------------------------------------ */

export function Expandable({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight > 288 + 4);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div>
      <div className="relative">
        <div ref={ref} className={cn("overflow-hidden", !open && "max-h-72")}>
          {children}
        </div>
        {overflowing && !open && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent"
          />
        )}
      </div>
      {overflowing && (
        <div className="flex justify-center px-4 pb-5 pt-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="rounded-full border border-[#003B73]/25 px-5 py-1.5 text-sm font-semibold text-[#003B73] transition hover:bg-[#003B73] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73]/40"
          >
            {open ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Specifications table                                                */
/* ------------------------------------------------------------------ */

export function SpecsTable({ rows }: { rows: SpecRow[] }) {
  return (
    <dl className="text-sm">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn(
            "grid gap-0.5 px-4 py-3 sm:grid-cols-[13rem_1fr] sm:gap-6 md:px-6",
            i % 2 === 0 ? "bg-gray-50/70" : "bg-white",
          )}
        >
          <dt className="font-medium text-gray-500">{row.label}</dt>
          <dd className="break-words text-gray-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Product rail (Related Products / Recently Viewed)                   */
/* ------------------------------------------------------------------ */

export function RailCard({ item }: { item: RailItem }) {
  return (
    <Link
      href={`/products/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#003B73]/20 hover:shadow-[0_14px_30px_-14px_rgba(0,59,115,0.35)]"
    >
      <div className="relative aspect-square bg-gray-50">
        <ProductImage
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 45vw, 240px"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug text-gray-800 transition-colors group-hover:text-[#003B73]">
          {item.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <strong className="text-base font-bold text-[#003B73]">
            {item.price}
          </strong>
          {item.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {item.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

const ARROW =
  "flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-[#003B73] hover:text-[#003B73] disabled:pointer-events-none disabled:opacity-40";

export function ProductRail({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: RailItem[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScroll: false,
    atStart: true,
    atEnd: true,
  });

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () =>
      setScrollState({
        canScroll: el.scrollWidth > el.clientWidth + 2,
        atStart: el.scrollLeft <= 2,
        atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <SectionCard
      id={id}
      title={title}
      action={
        scrollState.canScroll ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scrollBy(-1)}
              disabled={scrollState.atStart}
              className={ARROW}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scrollBy(1)}
              disabled={scrollState.atEnd}
              className={ARROW}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : null
      }
    >
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth p-4 md:scroll-px-6 md:p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.slug}
            className="w-[calc((100%-12px)/2)] flex-none snap-start sm:w-[calc((100%-24px)/3)] md:w-[calc((100%-36px)/4)] lg:w-[calc((100%-48px)/5)]"
          >
            <RailCard item={item} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Recently viewed (localStorage)                                      */
/* ------------------------------------------------------------------ */

const RECENT_KEY = "yuricart:recently-viewed";
const RECENT_MAX = 12;

function readRecent(): RailItem[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function RecentlyViewed({ current }: { current: RailItem }) {
  const [items, setItems] = useState<RailItem[]>([]);

  useEffect(() => {
    const next = [
      current,
      ...readRecent().filter((item) => item.slug !== current.slug),
    ].slice(0, RECENT_MAX);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — still show the in-memory list
    }
    setItems(next);
  }, [current]);

  return <ProductRail id="recently-viewed" title="Recently Viewed" items={items} />;
}

/* ------------------------------------------------------------------ */
/* Compare with similar items                                          */
/* ------------------------------------------------------------------ */

export function CompareTable({ items }: { items: CompareItem[] }) {
  if (items.length < 2) return null;

  const labels: string[] = [];
  items.forEach((item) =>
    Object.keys(item.specs).forEach((label) => {
      // "Brand" already has its own row built from the product's brand field
      if (label.toLowerCase() === "brand") return;
      if (!labels.includes(label)) labels.push(label);
    }),
  );

  const rows: Array<{ label: string; values: Array<string | undefined> }> = [
    { label: "Brand", values: items.map((i) => i.brand) },
    ...labels.slice(0, 20).map((label) => ({
      label,
      values: items.map((i) => i.specs[label]),
    })),
  ].filter((row) => row.values.some(Boolean));

  return (
    <SectionCard id="compare" title="Compare with similar items">
      <div className="overflow-x-auto">
        {/* table-fixed: every product column gets the same width, so rows line up */}
        <table
          className="w-full table-fixed border-separate border-spacing-0 text-sm"
          style={{ minWidth: `${7 + items.length * 11}rem` }}
        >
          <thead>
            <tr className="align-top">
              <th className="sticky left-0 z-10 w-28 bg-white md:w-44" />
              {items.map((item, index) => (
                <th
                  key={item.slug}
                  className={cn(
                    "border-b border-gray-100 p-3 text-left font-normal",
                    index === 0 && "bg-orange-50/70",
                  )}
                >
                  {/* Same-height slot in every column so the badge never shifts one column down */}
                  <div className="mb-2 h-5">
                    {index === 0 && (
                      <span className="inline-block rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase leading-4 tracking-wide text-white">
                        This product
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="group flex flex-col gap-1.5"
                  >
                    <div className="relative h-28 w-full rounded-lg bg-white ring-1 ring-gray-100">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="180px"
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="line-clamp-2 h-10 font-medium leading-snug text-gray-800 group-hover:text-[#003B73]">
                      {item.name}
                    </span>
                    <strong className="text-base text-[#003B73]">
                      {item.price}
                    </strong>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        item.inStock ? "text-green-700" : "text-red-600",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          item.inStock ? "bg-green-500" : "bg-red-500",
                        )}
                      />
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label}>
                <td
                  className={cn(
                    "sticky left-0 z-10 border-b border-gray-100 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 md:px-4",
                    i % 2 === 0 ? "bg-gray-50" : "bg-white",
                  )}
                >
                  {row.label}
                </td>
                {row.values.map((value, col) => (
                  <td
                    key={col}
                    className={cn(
                      "border-b border-gray-100 px-3 py-2.5 text-gray-800",
                      col === 0
                        ? i % 2 === 0
                          ? "bg-orange-50/80"
                          : "bg-orange-50/40"
                        : i % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white",
                    )}
                  >
                    {value || <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
