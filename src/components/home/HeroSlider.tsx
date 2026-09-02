"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomepageBannerItem } from "@/lib/api/homepage";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface HeroSliderProps {
  slides: HomepageBannerItem[];
}

function heroSrc(url: string) {
  return optimizeCloudinaryUrl(url, { width: 1600 });
}

function HeroSlideContent({
  slide,
  index,
  priority,
}: {
  slide: HomepageBannerItem;
  index: number;
  priority?: boolean;
}) {
  const href = slide.link || "/shop";
  const image = (
    <div className="relative aspect-[21/9] min-h-[160px] w-full bg-[#e8eef5] sm:min-h-[240px] md:min-h-[320px]">
      <Image
        src={heroSrc(slide.imageUrl)}
        alt={
          slide.slot
            ? `Yuricart hero banner — ${slide.slot.replace(/[-_]/g, " ")}`
            : `Yuricart hero banner ${index + 1}`
        }
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        quality={70}
        className="object-cover"
        sizes="(max-width: 1280px) 100vw, 1280px"
      />
    </div>
  );

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );
  }

  return <Link href={href}>{image}</Link>;
}

/** First paint: static hero (no Swiper JS) — critical for Speed Index / LCP */
function StaticHero({ slide }: { slide: HomepageBannerItem }) {
  return (
    <div className="home-hero overflow-hidden rounded-2xl">
      <HeroSlideContent slide={slide} index={0} priority />
    </div>
  );
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const activeSlides = slides.filter((s) => s.imageUrl);
  const [SwiperParts, setSwiperParts] = useState<{
    Swiper: typeof import("swiper/react").Swiper;
    SwiperSlide: typeof import("swiper/react").SwiperSlide;
    modules: import("swiper/types").SwiperModule[];
  } | null>(null);

  useEffect(() => {
    if (activeSlides.length <= 1) return;

    let cancelled = false;
    (async () => {
      const [{ Swiper, SwiperSlide }, { Pagination, Navigation, Autoplay }] =
        await Promise.all([
          import("swiper/react"),
          import("swiper/modules"),
          import("swiper/css"),
          import("swiper/css/pagination"),
          import("swiper/css/navigation"),
        ]);

      if (!cancelled) {
        setSwiperParts({
          Swiper,
          SwiperSlide,
          modules: [Pagination, Navigation, Autoplay],
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSlides.length]);

  if (!activeSlides.length) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-2xl bg-[#e8eef5] sm:h-[280px] md:h-[360px]">
        <p className="text-sm text-muted-foreground">No hero banners yet</p>
      </div>
    );
  }

  // Paint immediately without waiting for Swiper (Speed Index / LCP)
  if (!SwiperParts || activeSlides.length === 1) {
    return <StaticHero slide={activeSlides[0]} />;
  }

  const { Swiper, SwiperSlide, modules } = SwiperParts;

  return (
    <div className="home-hero overflow-hidden rounded-2xl">
      <Swiper
        style={
          {
            "--swiper-navigation-color": "#fff",
            "--swiper-navigation-size": "22px",
            "--swiper-pagination-color": "#fff",
          } as React.CSSProperties
        }
        pagination={{ clickable: true }}
        navigation={activeSlides.length > 1}
        loop={activeSlides.length > 1}
        autoplay={
          activeSlides.length > 1
            ? { delay: 4000, disableOnInteraction: false }
            : false
        }
        modules={modules}
        className="w-full"
      >
        {activeSlides.map((slide, index) => (
          <SwiperSlide key={slide.id || slide.slot || index}>
            <HeroSlideContent
              slide={slide}
              index={index}
              priority={index === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
