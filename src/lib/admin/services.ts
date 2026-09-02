import { adminApiRequest } from "./api";
import {
  AdminUser,
  AdminHomepageData,
  Banner,
  Brand,
  Category,
  AdminOrder,
  AdminCoupon,
  DashboardStats,
  FeaturedSectionConfig,
  HomepageBannerSlot,
  Product,
} from "./types";

export function adminLogin(email: string, password: string) {
  return adminApiRequest<{ token: string; user: AdminUser }>("/admin/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function adminLogout() {
  return adminApiRequest<{ message: string }>("/admin/auth/logout", {
    method: "POST",
  });
}

export function getAdminMe() {
  return adminApiRequest<AdminUser>("/admin/auth/me");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await adminApiRequest<DashboardStats>("/admin/dashboard");
  return data;
}

export function getAdminProducts(params: Record<string, string | number | boolean | undefined>) {
  return adminApiRequest<Product[]>("/admin/products", { params });
}

export function getAdminProduct(id: string) {
  return adminApiRequest<Product>(`/admin/products/${id}`);
}

export function createAdminProduct(body: Record<string, unknown> | FormData) {
  return adminApiRequest<Product>("/admin/products", { method: "POST", body });
}

export function updateAdminProduct(id: string, body: Record<string, unknown> | FormData) {
  return adminApiRequest<Product>(`/admin/products/${id}`, { method: "PATCH", body });
}

export function deleteAdminProduct(id: string) {
  return adminApiRequest<{ id: string }>(`/admin/products/${id}`, { method: "DELETE" });
}

export function getAdminCategories(params: Record<string, string | number | boolean | undefined>) {
  return adminApiRequest<Category[]>("/admin/categories", { params });
}

export function createAdminCategory(body: Record<string, unknown> | FormData) {
  return adminApiRequest<Category>("/admin/categories", { method: "POST", body });
}

export function updateAdminCategory(id: string, body: Record<string, unknown> | FormData) {
  return adminApiRequest<Category>(`/admin/categories/${id}`, { method: "PATCH", body });
}

export function deleteAdminCategory(id: string) {
  return adminApiRequest<{ id: string }>(`/admin/categories/${id}`, { method: "DELETE" });
}

export function getAdminBrands(params: Record<string, string | number | boolean | undefined>) {
  return adminApiRequest<Brand[]>("/admin/brands", { params });
}

export function createAdminBrand(body: Record<string, unknown> | FormData) {
  return adminApiRequest<Brand>("/admin/brands", { method: "POST", body });
}

export function updateAdminBrand(id: string, body: Record<string, unknown> | FormData) {
  return adminApiRequest<Brand>(`/admin/brands/${id}`, { method: "PATCH", body });
}

export function deleteAdminBrand(id: string) {
  return adminApiRequest<{ id: string }>(`/admin/brands/${id}`, { method: "DELETE" });
}

export function getAdminBanners(params: Record<string, string | number | boolean | undefined>) {
  return adminApiRequest<Banner[]>("/admin/banners", { params });
}

export function createAdminBanner(body: Record<string, unknown> | FormData) {
  return adminApiRequest<Banner>("/admin/banners", { method: "POST", body });
}

export function updateAdminBanner(id: string, body: Record<string, unknown> | FormData) {
  return adminApiRequest<Banner>(`/admin/banners/${id}`, { method: "PATCH", body });
}

export function deleteAdminBanner(id: string) {
  return adminApiRequest<{ id: string }>(`/admin/banners/${id}`, { method: "DELETE" });
}

export function getAdminHomepage() {
  return adminApiRequest<AdminHomepageData>("/admin/homepage");
}

export function createAdminHeroSlide(body: FormData) {
  return adminApiRequest<HomepageBannerSlot>("/admin/homepage/hero", {
    method: "POST",
    body,
  });
}

export function updateAdminHeroSlide(id: string, body: FormData) {
  return adminApiRequest<HomepageBannerSlot>(`/admin/homepage/hero/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deleteAdminHeroSlide(id: string) {
  return adminApiRequest<{ id: string }>(`/admin/homepage/hero/${id}`, {
    method: "DELETE",
  });
}

export function reorderAdminHeroSlides(orderedIds: string[]) {
  return adminApiRequest<HomepageBannerSlot[]>("/admin/homepage/hero/reorder", {
    method: "PATCH",
    body: { orderedIds },
  });
}

export function upsertAdminHomepageBanner(
  section: string,
  slot: string,
  body: FormData,
) {
  return adminApiRequest<HomepageBannerSlot>(
    `/admin/homepage/banners/${section}/${slot}`,
    { method: "PUT", body },
  );
}

export function updateAdminFeaturedSections(featuredSections: FeaturedSectionConfig[]) {
  return adminApiRequest<FeaturedSectionConfig[]>(
    "/admin/homepage/featured-sections",
    { method: "PATCH", body: { featuredSections } },
  );
}

export function getAllCategoriesForSelect() {
  return adminApiRequest<Category[]>("/admin/categories", {
    params: { limit: 100, page: 1, sort: "sortOrder_asc" },
  });
}

export function getAllBrandsForSelect() {
  return adminApiRequest<Brand[]>("/admin/brands", {
    params: { limit: 100, page: 1, sort: "name_asc" },
  });
}

export function getAdminOrders(params: Record<string, string | number | boolean | undefined>) {
  return adminApiRequest<AdminOrder[]>("/admin/orders", { params });
}

export function updateAdminOrder(id: string, body: Record<string, unknown>) {
  return adminApiRequest<AdminOrder>(`/admin/orders/${id}`, { method: "PATCH", body });
}

export function getAdminCoupons(params: Record<string, string | number | boolean | undefined>) {
  return adminApiRequest<AdminCoupon[]>("/admin/coupons", { params });
}

export function createAdminCoupon(body: Record<string, unknown>) {
  return adminApiRequest<AdminCoupon>("/admin/coupons", { method: "POST", body });
}

export function deleteAdminCoupon(id: string) {
  return adminApiRequest<{ id: string }>(`/admin/coupons/${id}`, { method: "DELETE" });
}

export function getAdminSettings(group?: string) {
  return adminApiRequest<Record<string, unknown>>("/admin/settings", {
    params: group ? { group } : undefined,
  });
}

export function updateAdminSettings(body: Record<string, unknown>) {
  return adminApiRequest<Record<string, unknown>>("/admin/settings", {
    method: "PATCH",
    body,
  });
}
