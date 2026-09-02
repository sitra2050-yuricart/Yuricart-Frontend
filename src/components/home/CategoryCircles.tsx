import Image from "next/image";
import Link from "next/link";
import { HomepageCategory } from "@/lib/api/homepage";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface CategoryCirclesProps {
  categories: HomepageCategory[];
}

export default function CategoryCircles({ categories }: CategoryCirclesProps) {
  if (!categories.length) return null;

  return (
    <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex w-max min-w-full items-start justify-center gap-5 px-1 sm:gap-8 md:gap-10">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/collections/${cat.slug}`}
            className="group flex w-[88px] shrink-0 flex-col items-center gap-2 sm:w-[100px]"
          >
            <div className="relative size-[72px] overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 sm:size-[88px]">
              {cat.imageUrl ? (
                <Image
                  src={optimizeCloudinaryUrl(cat.imageUrl, { width: 176 })}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="88px"
                  quality={75}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#e8eef5] text-xs font-semibold text-[#003B73]">
                  {cat.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-center text-xs font-semibold uppercase tracking-wide text-gray-900 sm:text-sm">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
