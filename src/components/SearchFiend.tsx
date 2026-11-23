"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { trackSearch } from "@/lib/metaPixel";

interface SearchFieldProps {
  className?: string;
}

/** Site search: a labelled field with a real submit button. */
export default function SearchField({ className }: SearchFieldProps) {
  const router = useRouter();
  const inputId = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string | null)?.trim();
    if (!q) return;

    trackSearch({ search_string: q });
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      method="GET"
      action="/shop"
      className={cn("grow", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Input
          id={inputId}
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Search products..."
          className="pe-12"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <SearchIcon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
