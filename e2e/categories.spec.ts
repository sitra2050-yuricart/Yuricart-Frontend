import { expect, test } from "@playwright/test";

// The mock API has three categories: Laptops and Printers have products,
// Accessories is empty (like the live site).

test.describe("empty categories", () => {
  test("are hidden from the header, chips, footer and categories page", async ({ page }) => {
    for (const path of ["/", "/shop", "/categories"]) {
      await page.goto(path);
      await expect(page.getByRole("link", { name: "Laptops" }).first()).toBeAttached();
      await expect(page.locator('a[href="/collections/accessories"]'), path).toHaveCount(0);
    }
  });

  test("are left out of the sitemap but real categories stay in", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/collections/laptops");
    expect(xml).not.toContain("/collections/accessories");
  });

  test("the page still works: friendly message, noindex, header shows it as current", async ({ page }) => {
    const response = await page.goto("/collections/accessories");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Accessories", level: 1 })).toBeVisible();
    await expect(page.getByText("Nothing here yet")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse all products" })).toHaveAttribute("href", "/shop");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
    // no filter toolbar on an empty category
    await expect(page.getByLabel("Minimum price")).toHaveCount(0);
    // the category being viewed is still in the chip row so the page makes sense
    await expect(page.getByRole("navigation", { name: "Shop by category" }).getByRole("link", { name: "Accessories" })).toBeVisible();
  });

  test("a filtered search with no results keeps the toolbar and says so", async ({ page }) => {
    await page.goto("/collections/laptops?price_min=900000");
    await expect(page.getByText("No products found")).toBeVisible();
    await expect(page.getByLabel("Minimum price")).toBeVisible();
  });
});
