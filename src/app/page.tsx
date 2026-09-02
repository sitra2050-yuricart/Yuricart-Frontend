import HeroSlider from "@/components/home/HeroSlider";
import PromoCards from "@/components/home/PromoCards";
import CategoryCircles from "@/components/home/CategoryCircles";
import {
  DeferredBannerGrid,
  DeferredProductCarousel,
} from "@/components/home/DeferredHomeSections";
import { getHomepage } from "@/lib/api/homepage";
import {
  absoluteSeoTitle,
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildWebSiteJsonLd,
  siteConfig,
} from "@/lib/seo";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { preload } from "react-dom";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Electronics Store — Phones, Laptops & More",
    description: siteConfig.description,
    path: "/",
  }),
  title: absoluteSeoTitle(
    "Yuricart Kenya | Electronics Store — Phones, Laptops & More",
  ),
};

export default async function Home() {
  let data;
  try {
    data = await getHomepage();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">
          Unable to load homepage. Please try again later.
        </p>
      </main>
    );
  }

  const featuredById = Object.fromEntries(
    data.featuredSections.map((s) => [s.id, s]),
  );

  const organizationJsonLd = buildOrganizationJsonLd();
  const websiteJsonLd = buildWebSiteJsonLd();

  const firstHero = data.heroSlides.find((s) => s.imageUrl);
  if (firstHero?.imageUrl) {
    preload(optimizeCloudinaryUrl(firstHero.imageUrl, { width: 1600 }), {
      as: "image",
      fetchPriority: "high",
    });
  }

  return (
    <main className="bg-[#f7f8fa]">
      <h1 className="sr-only">
        Yuricart Kenya — Shop electronics, phones, laptops and accessories
      </h1>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <div className="mx-auto max-w-7xl space-y-8 px-3 py-5 sm:space-y-10 sm:px-5 md:py-8">
        {/* Above-the-fold: keep eager for Speed Index */}
        <HeroSlider slides={data.heroSlides} />
        <PromoCards cards={data.promoCards} />
        <CategoryCircles categories={data.categories} />

        {/* Below-the-fold: deferred so hero wins bandwidth */}
        <DeferredBannerGrid
          title="Mobiles & Accessories"
          banners={data.mobileBanners}
        />

        {featuredById.mobiles && (
          <DeferredProductCarousel
            title={featuredById.mobiles.title}
            products={featuredById.mobiles.products}
          />
        )}

        <DeferredBannerGrid
          title="Laptops & Computing"
          banners={data.laptopBanners}
        />

        {featuredById.laptops && (
          <DeferredProductCarousel
            title={featuredById.laptops.title}
            products={featuredById.laptops.products}
          />
        )}

        <DeferredBannerGrid
          title="Smart Gadgets & Accessories"
          banners={data.smartBanners}
        />

        {featuredById.desktops && (
          <DeferredProductCarousel
            title={featuredById.desktops.title}
            products={featuredById.desktops.products}
          />
        )}

        <DeferredBannerGrid
          title="Desktop Promotions"
          banners={data.desktopBanners}
        />

        {featuredById.featured && (
          <DeferredProductCarousel
            title={featuredById.featured.title}
            products={featuredById.featured.products}
          />
        )}
      </div>
    </main>
  );
}
