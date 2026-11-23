"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const SORTS = [
  { value: "createdAt_desc", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "title_asc", label: "Name: A to Z" },
];

const FIELD =
  "h-10 rounded-full border-0 bg-white px-4 text-sm text-gray-900 ring-1 ring-gray-900/10 transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]";

/** Result count, price range and sort. All state lives in the URL. */
export default function ListingToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const urlMin = params.get("price_min") ?? "";
  const urlMax = params.get("price_max") ?? "";
  const sort = params.get("sort") || "createdAt_desc";

  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);
  useEffect(() => {
    setMin(urlMin);
    setMax(urlMax);
  }, [urlMin, urlMax]);

  function push(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  const hasPrice = !!urlMin || !!urlMax;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-4"
      data-pending={pending ? "" : undefined}
    >
      <p className="px-1 text-sm text-gray-600" aria-live="polite">
        <span className="font-bold text-gray-900">{total}</span>{" "}
        {total === 1 ? "product" : "products"} found
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            push({ price_min: min || undefined, price_max: max || undefined });
          }}
        >
          <input
            type="number"
            min={0}
            inputMode="numeric"
            aria-label="Minimum price"
            placeholder="Min Kes"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={`${FIELD} w-24`}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            aria-label="Maximum price"
            placeholder="Max Kes"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={`${FIELD} w-24`}
          />
          <button
            type="submit"
            className="h-10 rounded-full bg-[#003B73] px-4 text-sm font-semibold text-white transition hover:bg-[#002f5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73] focus-visible:ring-offset-2"
          >
            Apply
          </button>
          {hasPrice ? (
            <button
              type="button"
              onClick={() => push({ price_min: undefined, price_max: undefined })}
              className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-[#003B73] hover:underline"
            >
              Clear
            </button>
          ) : null}
        </form>

        <label className="relative flex items-center">
          <ArrowUpDown
            className="pointer-events-none absolute left-3.5 size-4 text-gray-400"
            aria-hidden
          />
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) =>
              push({
                sort: e.target.value === "createdAt_desc" ? undefined : e.target.value,
              })
            }
            className={`${FIELD} cursor-pointer pl-10 pr-4 font-medium`}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
