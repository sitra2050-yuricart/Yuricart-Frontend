export { apiRequest, apiRequestPaginated, getApiBaseUrl, StorefrontApiError } from "./client";

export {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getProductsByCategorySlug,
  searchProducts,
  getFeaturedProducts,
  getNewArrivalProducts,
  getBestSellerProducts,
} from "./products";

export {
  getCategories,
  getCategoryBySlug,
  getAllCategories,
} from "./categories";

export {
  getBrands,
  getBrandBySlug,
  getAllBrands,
} from "./brands";

export {
  getBanners,
  getBannerBySlug,
  getHeroBanners,
  getPromoBanners,
} from "./banners";

export { getHomepage } from "./homepage";
export type {
  HomepageData,
  HomepageBannerItem,
  HomepageBannerGrid,
  HomepageCategory,
  HomepageFeaturedSection,
} from "./homepage";

export {
  getProductPrimaryImage,
  getProductImageUrl,
  getProductGallery,
  getProductVideo,
  getProductEffectivePrice,
  hasProductDiscount,
  getProductDiscountPercent,
  isProductInStock,
  getCategoryName,
  getCategoryImageUrl,
  getBrandName,
} from "./product-utils";

export {
  toLegacyProductCard,
  toLegacyProductCards,
  toLegacyProductDetail,
} from "./adapters";

export type { LegacyProductCard, LegacyProductDetail } from "./adapters";

export { createOrder, trackOrder, getMyOrders } from "./orders";
export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomerMe,
  getCustomerToken,
  clearCustomerToken,
} from "./auth";
export type { CustomerUser, AuthResponse } from "./auth";

export type {
  ApiResponse,
  Banner,
  BannerQueryParams,
  Brand,
  BrandQueryParams,
  CartItem,
  Category,
  CategoryQueryParams,
  Order,
  OrderItem,
  PaginatedResult,
  PaginationMeta,
  Product,
  ProductQueryParams,
  ProductsSort,
} from "./types";
