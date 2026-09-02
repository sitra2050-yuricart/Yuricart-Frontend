import { apiRequest } from "./client";
import { Product } from "./types";

export interface HomepageBannerItem {
  id?: string;
  slot?: string;
  imageUrl: string;
  link: string;
  active?: boolean;
  sortOrder?: number;
}

export interface HomepageBannerGrid {
  left1: HomepageBannerItem | null;
  left2: HomepageBannerItem | null;
  left3: HomepageBannerItem | null;
  left4: HomepageBannerItem | null;
}

export interface HomepageCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export interface HomepageFeaturedSection {
  id: string;
  title: string;
  categorySlug: string | null;
  products: Product[];
}

export interface HomepageData {
  heroSlides: HomepageBannerItem[];
  promoCards: HomepageBannerItem[];
  mobileBanners: HomepageBannerGrid;
  laptopBanners: HomepageBannerGrid;
  smartBanners: HomepageBannerGrid;
  desktopBanners: HomepageBannerGrid;
  categories: HomepageCategory[];
  featuredSections: HomepageFeaturedSection[];
}

export async function getHomepage(): Promise<HomepageData> {
  const { data } = await apiRequest<HomepageData>("/homepage", {
    next: { revalidate: 60 },
  });
  return data;
}
