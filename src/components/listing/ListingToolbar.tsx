"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Brand } from "@/lib/api/types";
import { formatKes } from "@/lib/product-specs";

const SORTS = [
  { value: "createdAt_desc", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "title_asc", label: "Name: A to Z" },
];

const FIELD =
  "h-10 rounded-full border-0 bg-white px-4 text-sm text-gray-900 ring-1 ring-gray-900/15 transition placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary";

const BUTTON =
  "inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

interface Filters {
  brand: string;
  inStock: boolean;
  min: string;
  max: string;
  sort: string;
}

type Updates = Partial<Record<"brand" | "in_stock" | "price_min" | "price_max" | "sort", string | undefined>>;

/** Applies URL-style updates to the filter state. */
function applyUpdates(current: Filters, updates: Updates): Filters {
  const next = { ...current };
  if ("brand" in updates) next.brand = updates.brand ?? "";
  if ("in_stock" in updates) next.inStock = updates.in_stock === "1";
  if ("price_min" in updates) next.min = updates.price_min ?? "";
  if ("price_max" in updates) next.max = updates.price_max ?? "";
  if ("sort" in updates) next.sort = updates.sort || "createdAt_desc";
  return next;
}

/**
 * All filter state lives in the URL, so a filtered list can be shared or
 * reloaded. The controls update at once (optimistically) while the server
 * renders the new list, so a click never looks ignored.
 */
function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const fromUrl: Filters = {
    brand: params.get("brand") ?? "",
    inStock: params.get("in_stock") === "1",
    min: params.get("price_min") ?? "",
    max: params.get("price_max") ?? "",
    sort: params.get("sort") || "createdAt_desc",
  };
  const [filters, setOptimistic] = useOptimistic(fromUrl);

  function push(updates: Updates) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      setOptimistic(applyUpdates(filters, updates));
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  const activeCount =
    (filters.brand ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.min || filters.max ? 1 : 0);

  return { filters, push, pending, activeCount };
}

function SortSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`relative flex items-center ${className ?? ""}`}>
      <ArrowUpDown className="pointer-events-none absolute left-3.5 size-4 text-gray-500" aria-hidden />
      <span className="sr-only">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} w-full cursor-pointer pl-10 pr-4 font-medium`}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BrandSelect({
  brands,
  value,
  onChange,
  className,
}: {
  brands: Brand[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  if (!brands.length) return null;
  return (
    <label className={className}>
      <span className="sr-only">Brand</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} w-full cursor-pointer pr-4 font-medium`}
      >
        <option value="">All brands</option>
        {brands.map((brand) => (
          <option key={brand._id} value={brand.slug}>
            {brand.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function StockToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-gray-800 ring-1 ring-gray-900/15 transition has-[:checked]:bg-brand-soft has-[:checked]:ring-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary focus:outline-none"
      />
      In stock only
    </label>
  );
}

function PriceFields({
  min,
  max,
  onMin,
  onMax,
}: {
  min: string;
  max: string;
  onMin: (value: string) => void;
  onMax: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label="Minimum price"
        placeholder="Min Kes"
        value={min}
        onChange={(e) => onMin(e.target.value)}
        className={`${FIELD} w-full sm:w-24`}
      />
      <span className="text-gray-500" aria-hidden="true">
        –
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label="Maximum price"
        placeholder="Max Kes"
        value={max}
        onChange={(e) => onMax(e.target.value)}
        className={`${FIELD} w-full sm:w-24`}
      />
    </div>
  );
}

/** Result count, filters and sort. Inline on desktop, a bottom sheet on phones. */
export default function ListingToolbar({
  total,
  brands = [],
}: {
  total: number;
  brands?: Brand[];
}) {
  const { filters, push, pending, activeCount } = useFilters();

  // Price is applied with a button; keep its draft in step with the URL.
  const [min, setMin] = useState(filters.min);
  const [max, setMax] = useState(filters.max);
  useEffect(() => {
    setMin(filters.min);
    setMax(filters.max);
  }, [filters.min, filters.max]);

  // Sheet draft: nothing is applied until "Show results".
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  useEffect(() => {
    if (open) setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const brandName = brands.find((b) => b.slug === filters.brand)?.name ?? filters.brand;
  const chips: Array<{ label: string; remove: Updates }> = [];
  if (filters.brand) chips.push({ label: brandName, remove: { brand: undefined } });
  if (filters.inStock) chips.push({ label: "In stock", remove: { in_stock: undefined } });
  if (filters.min || filters.max) {
    const label =
      filters.min && filters.max
        ? `${formatKes(Number(filters.min))} – ${formatKes(Number(filters.max))}`
        : filters.min
          ? `From ${formatKes(Number(filters.min))}`
          : `Up to ${formatKes(Number(filters.max))}`;
    chips.push({ label, remove: { price_min: undefined, price_max: undefined } });
  }

  return (
    <div className="space-y-3" data-pending={pending ? "" : undefined}>
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:flex-row md:items-center md:justify-between md:px-4">
        <div className="flex items-center justify-between gap-3">
          <p className="px-1 text-sm text-gray-700" aria-live="polite">
            <span className="font-bold text-gray-900">{total}</span>{" "}
            {total === 1 ? "product" : "products"} found
          </p>

          {/* Phones: one button opens the sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-gray-900 ring-1 ring-gray-900/15 transition hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Filter &amp; sort
                {activeCount > 0 ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    <span className="sr-only">{activeCount} active filters</span>
                    <span aria-hidden>{activeCount}</span>
                  </span>
                ) : null}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl">
              <form
                className="space-y-5 pb-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  push({
                    brand: draft.brand || undefined,
                    in_stock: draft.inStock ? "1" : undefined,
                    price_min: draft.min || undefined,
                    price_max: draft.max || undefined,
                    sort: draft.sort === "createdAt_desc" ? undefined : draft.sort,
                  });
                  setOpen(false);
                }}
              >
                <SheetHeader>
                  <SheetTitle>Filter &amp; sort</SheetTitle>
                  <SheetDescription>Narrow the list, then show the results.</SheetDescription>
                </SheetHeader>

                <SortSelect value={draft.sort} onChange={(sort) => setDraft((d) => ({ ...d, sort }))} />
                <BrandSelect
                  brands={brands}
                  value={draft.brand}
                  onChange={(brand) => setDraft((d) => ({ ...d, brand }))}
                />
                <StockToggle
                  checked={draft.inStock}
                  onChange={(inStock) => setDraft((d) => ({ ...d, inStock }))}
                />
                <PriceFields
                  min={draft.min}
                  max={draft.max}
                  onMin={(v) => setDraft((d) => ({ ...d, min: v }))}
                  onMax={(v) => setDraft((d) => ({ ...d, max: v }))}
                />

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({ brand: "", inStock: false, min: "", max: "", sort: "createdAt_desc" })
                    }
                    className="h-11 flex-1 rounded-full bg-white text-sm font-semibold text-gray-800 ring-1 ring-gray-900/15 transition hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Clear all
                  </button>
                  <button type="submit" className={`${BUTTON} h-11 flex-[2]`}>
                    Show results
                  </button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {/* Tablet and desktop: inline controls apply as you change them */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <BrandSelect
            brands={brands}
            value={filters.brand}
            onChange={(brand) => push({ brand: brand || undefined })}
          />
          <StockToggle
            checked={filters.inStock}
            onChange={(checked) => push({ in_stock: checked ? "1" : undefined })}
          />
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              push({ price_min: min || undefined, price_max: max || undefined });
            }}
          >
            <PriceFields min={min} max={max} onMin={setMin} onMax={setMax} />
            <button type="submit" className={BUTTON}>
              Apply
            </button>
          </form>
          <SortSelect
            value={filters.sort}
            onChange={(sort) => push({ sort: sort === "createdAt_desc" ? undefined : sort })}
          />
        </div>
      </div>

      {chips.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
          {chips.map((chip) => (
            <li key={chip.label}>
              <button
                type="button"
                onClick={() => push(chip.remove)}
                aria-label={`Remove filter: ${chip.label}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {chip.label}
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() =>
                push({ brand: undefined, in_stock: undefined, price_min: undefined, price_max: undefined })
              }
              className="rounded-full px-2 py-1.5 text-sm font-medium text-gray-700 underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
