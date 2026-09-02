import Image from "next/image";
import Link from "next/link";
import { HomepageBannerGrid, HomepageBannerItem } from "@/lib/api/homepage";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface BannerGridProps {
  title: string;
  banners: HomepageBannerGrid;
}

function BannerLink({
  item,
  className,
  sizes,
  sectionTitle,
}: {
  item: HomepageBannerItem | null;
  className?: string;
  sizes?: string;
  sectionTitle: string;
}) {
  if (!item?.imageUrl) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#e8eef5] ${className || ""}`}
      />
    );
  }

  const href = item.link || "/shop";
  const alt =
    item.slot
      ? `${sectionTitle} — ${item.slot}`
      : `${sectionTitle} banner`;
  const inner = (
    <div
      className={`relative overflow-hidden rounded-xl ${className || ""}`}
    >
      <Image
        src={optimizeCloudinaryUrl(item.imageUrl, { width: 800 })}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 hover:scale-[1.02]"
        sizes={sizes || "(max-width: 768px) 50vw, 30vw"}
        quality={75}
      />
    </div>
  );

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  );
}

export default function BannerGrid({ title, banners }: BannerGridProps) {
  const hasAny = Object.values(banners).some((b) => b?.imageUrl);
  if (!hasAny) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <BannerLink item={banners.left1} sectionTitle={title} className="aspect-[3/2] w-full" />
        <BannerLink item={banners.left2} sectionTitle={title} className="aspect-[3/2] w-full" />
        <BannerLink item={banners.left3} sectionTitle={title} className="aspect-[3/2] w-full" />
        <BannerLink item={banners.left4} sectionTitle={title} className="aspect-[3/2] w-full" />
      </div>
    </section>
  );
}
