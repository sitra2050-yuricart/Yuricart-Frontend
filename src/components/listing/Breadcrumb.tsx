import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/** Pill breadcrumb: linked steps are soft chips, the current page is plain text. */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-[13px]"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 ? (
            <ChevronRight className="size-3.5 text-gray-300" aria-hidden />
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              className="rounded-full bg-white px-3 py-1 font-medium text-gray-600 ring-1 ring-gray-900/5 transition hover:text-[#003B73] hover:ring-[#003B73]/30"
            >
              {item.label}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="px-1 font-semibold text-gray-900"
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
