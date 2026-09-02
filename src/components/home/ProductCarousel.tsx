"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Product } from "@/lib/api/types";
import HomeProductCard from "./HomeProductCard";

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  if (!products.length) return null;

  const canLoop = products.length > 4;

  return (
    <section className="home-product-carousel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            ref={prevRef}
            aria-label="Previous products"
            className="flex size-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-[#003B73] hover:text-[#003B73] disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            ref={nextRef}
            aria-label="Next products"
            className="flex size-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-[#003B73] hover:text-[#003B73] disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <Swiper
          modules={[Autoplay, Navigation, A11y]}
          onBeforeInit={(swiper) => {
            const nav = swiper.params.navigation;
            if (nav && typeof nav !== "boolean") {
              nav.prevEl = prevRef.current;
              nav.nextEl = nextRef.current;
            }
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // Re-bind nav after mount so refs are ready
            setTimeout(() => {
              if (
                swiper.params.navigation &&
                typeof swiper.params.navigation !== "boolean"
              ) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
              swiper.navigation?.destroy();
              swiper.navigation?.init();
              swiper.navigation?.update();
            }, 0);
          }}
          slidesPerView="auto"
          slidesPerGroup={1}
          spaceBetween={16}
          speed={350}
          grabCursor
          simulateTouch
          allowTouchMove
          threshold={8}
          preventClicks
          preventClicksPropagation
          touchStartPreventDefault={false}
          loop={canLoop}
          autoplay={
            products.length > 1
              ? {
                  delay: 2200,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          breakpoints={{
            0: { spaceBetween: 12 },
            640: { spaceBetween: 16 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide
              key={product._id}
              className="!h-auto !w-[200px] sm:!w-[220px]"
            >
              <HomeProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
