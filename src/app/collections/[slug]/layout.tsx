import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getCategoryBySlug, getCategoryImageUrl } from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function Layout({ children, params }: LayoutProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CollectionsLayout params={params}>{children}</CollectionsLayout>
    </Suspense>
  );
}

async function CollectionsLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const banner = getCategoryImageUrl(category.image);
  const bannerSrc = banner
    ? optimizeCloudinaryUrl(banner, { width: 1280 })
    : "";
  const bannerAlt =
    (typeof category.image === "object" && category.image?.alt?.trim()) ||
    category.name;

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <div className="flex flex-col gap-10">
        {bannerSrc ? (
          <div className="relative hidden aspect-[21/7] max-h-[280px] w-full overflow-hidden rounded-xl sm:block md:max-h-[320px]">
            <Image
              src={bannerSrc}
              fill
              alt={bannerAlt}
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
            {/* Visual only — page keeps a single <h1> below */}
            <p
              aria-hidden="true"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-3xl font-bold text-white md:bottom-8 md:text-4xl lg:text-5xl"
            >
              {category.name}
            </p>
          </div>
        ) : null}
        <h1
          className={cn(
            "mx-auto text-3xl font-bold md:text-4xl",
            banner && "sm:sr-only",
          )}
        >
          {category.name}
        </h1>
      </div>
      {children}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <Skeleton className="mx-auto hidden h-10 w-48 sm:block sm:aspect-[21/7] sm:h-auto sm:max-h-[320px] sm:w-full sm:rounded-xl" />
      <div className="space-y-5">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[26rem] w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}
