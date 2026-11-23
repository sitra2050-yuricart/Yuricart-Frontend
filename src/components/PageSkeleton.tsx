import { Skeleton } from "@/components/ui/skeleton";

/** Neutral page skeleton for routes that stream in (used by loading.tsx files). */
export default function PageSkeleton() {
  return (
    <div
      className="mx-auto max-w-[88rem] space-y-5 px-5 py-6 sm:py-8"
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="h-6 w-48 rounded-full" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[19rem] w-full rounded-2xl" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
