"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, SearchIcon, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "./ui/input";
import ProductImage from "./ProductImage";
import { trackSearch } from "@/lib/metaPixel";
import { suggestProducts, type ProductSuggestion } from "@/lib/api/search";
import {
  getProductImageUrl,
  getUnitPrice,
  hasProductDiscount,
  PRICE_ON_REQUEST,
} from "@/lib/api/product-utils";
import type { Product } from "@/lib/api/types";

interface SearchFieldProps {
  className?: string;
}

const MIN_CHARS = 2;
const DEBOUNCE_MS = 220;

type Status = "idle" | "loading" | "ready" | "error";

/**
 * Site search with a live product dropdown. It is a combobox: arrow keys move through
 * the products, Enter opens the highlighted one (or runs the full search), Escape closes.
 */
function SearchFieldInner({ className }: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlQuery = useSearchParams().get("q") ?? "";
  const inputId = useId();
  const listId = `${inputId}-list`;
  const rootRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  // On the results page the box shows what was searched, so it can be edited or cleared.
  const [value, setValue] = useState(pathname === "/shop" ? urlQuery : "");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [items, setItems] = useState<ProductSuggestion[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    setValue(pathname === "/shop" ? urlQuery : "");
    setOpen(false);
  }, [pathname, urlQuery]);

  const query = value.trim();
  const searchable = query.length >= MIN_CHARS;

  useEffect(() => {
    if (!searchable) {
      setStatus("idle");
      setItems([]);
      return;
    }
    setStatus("loading");
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const found = await suggestProducts(query);
        if (id !== requestId.current) return; // a newer search has started
        setItems(found);
        setStatus("ready");
        setActive(-1);
      } catch {
        if (id !== requestId.current) return;
        setItems([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, searchable]);

  // Close when focus or a click moves outside the search box.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const showPanel = open && searchable;
  // The options: products, then the "see all" row.
  const optionCount = items.length + (status === "ready" || status === "error" ? 1 : 0);
  const allHref = `/shop?q=${encodeURIComponent(query)}`;

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function runSearch() {
    if (!query) return;
    trackSearch({ search_string: query });
    goTo(allHref);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (showPanel && active >= 0 && active < items.length) {
      goTo(`/products/${items[active].slug}`);
      return;
    }
    runSearch();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
      return;
    }
    if (!searchable || optionCount === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((current) => {
        const step = e.key === "ArrowDown" ? 1 : -1;
        // -1 means "no option highlighted": wrap through it so Up from the first row returns to the input.
        return ((current + 1 + step + optionCount + 1) % (optionCount + 1)) - 1;
      });
    }
  }

  function clear() {
    setValue("");
    setOpen(false);
    setItems([]);
    setStatus("idle");
    inputRef.current?.focus();
  }

  const activeId = active >= 0 ? `${inputId}-opt-${active}` : undefined;

  return (
    <form
      ref={rootRef}
      role="search"
      onSubmit={handleSubmit}
      method="GET"
      action="/shop"
      className={cn("relative grow", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={inputId}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Search products..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn("pe-20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none")}
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-11 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SearchIcon className="size-5" aria-hidden="true" />
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {showPanel && status === "ready"
          ? items.length
            ? `${items.length} suggestions available`
            : "No matching products"
          : ""}
      </p>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Product suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-1.5 text-left text-gray-900 shadow-[0_12px_40px_-8px_rgba(16,24,40,0.35)] ring-1 ring-gray-900/10"
        >
          {status === "loading" && items.length === 0 ? (
            <div aria-hidden className="space-y-1 p-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2">
                  <div className="size-12 animate-pulse rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {status === "error" ? (
            <p className="px-3 py-3 text-sm text-gray-700">We could not load suggestions right now.</p>
          ) : null}

          {status === "ready" && items.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-700">
              No products match <strong>“{query}”</strong>. Try fewer or different words.
            </p>
          ) : null}

          {items.map((product, index) => (
            <Suggestion
              key={product._id}
              product={product}
              id={`${inputId}-opt-${index}`}
              active={active === index}
              onHover={() => setActive(index)}
              onChoose={() => setOpen(false)}
            />
          ))}

          {status === "ready" || status === "error" ? (
            <Link
              id={`${inputId}-opt-${items.length}`}
              role="option"
              aria-selected={active === items.length}
              href={allHref}
              onClick={() => {
                trackSearch({ search_string: query });
                setOpen(false);
              }}
              onMouseEnter={() => setActive(items.length)}
              className={cn(
                "mt-1 flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-primary transition",
                active === items.length ? "bg-brand-soft" : "hover:bg-brand-soft",
              )}
            >
              <span className="min-w-0 truncate">See all results for “{query}”</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

function Suggestion({
  product,
  id,
  active,
  onHover,
  onChoose,
}: {
  product: ProductSuggestion;
  id: string;
  active: boolean;
  onHover: () => void;
  onChoose: () => void;
}) {
  const asProduct = product as unknown as Product;
  const price = getUnitPrice(product);
  const onSale = hasProductDiscount(asProduct);
  const outOfStock = product.stock <= 0;

  return (
    <Link
      id={id}
      role="option"
      aria-selected={active}
      href={`/products/${product.slug}`}
      onClick={onChoose}
      onMouseEnter={onHover}
      className={cn(
        "flex items-center gap-3 rounded-xl p-2 transition",
        active ? "bg-brand-soft" : "hover:bg-brand-soft",
      )}
    >
      <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-gray-900/10">
        <ProductImage
          src={getProductImageUrl(asProduct)}
          width={48}
          height={48}
          alt=""
          className="size-full object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{product.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
          {price > 0 ? (
            <>
              <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
              {onSale ? (
                <span className="text-xs text-gray-600 line-through">{formatCurrency(product.price)}</span>
              ) : null}
            </>
          ) : (
            <span className="text-gray-700">{PRICE_ON_REQUEST}</span>
          )}
          {outOfStock ? <span className="text-xs font-medium text-red-800">Out of stock</span> : null}
        </span>
      </span>
    </Link>
  );
}

export default function SearchField(props: SearchFieldProps) {
  return (
    <Suspense fallback={<div className={cn("h-10 grow rounded-full bg-white", props.className)} aria-hidden />}>
      <SearchFieldInner {...props} />
    </Suspense>
  );
}
