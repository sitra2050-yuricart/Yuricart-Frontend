import Image from "next/image";
import Link from "next/link";
import { HomepageBannerItem } from "@/lib/api/homepage";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface PromoCardsProps {
  cards: HomepageBannerItem[];
}

function BannerLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {children}
      </a>
    );
  }
  return (
    <Link href={href || "/shop"} className="block h-full">
      {children}
    </Link>
  );
}

export default function PromoCards({ cards }: PromoCardsProps) {
  const items = cards.filter((c) => c.imageUrl).slice(0, 3);
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((card, index) => (
        <BannerLink key={card.slot || card.id || index} href={card.link || "/shop"}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#e8eef5] transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src={optimizeCloudinaryUrl(card.imageUrl, { width: 800 })}
              alt={
                card.slot
                  ? `Yuricart promo ${card.slot}`
                  : `Yuricart promo offer ${index + 1}`
              }
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
              quality={75}
            />
          </div>
        </BannerLink>
      ))}
    </div>
  );
}
