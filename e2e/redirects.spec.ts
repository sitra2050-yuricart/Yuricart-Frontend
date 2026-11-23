import { expect, test } from "@playwright/test";

// The mock API maps three old paths (see e2e/mock-api.mjs).
test.describe("old URLs redirect instead of 404", () => {
  test("a renamed collection redirects permanently to the new one", async ({ request, page }) => {
    const response = await request.get("/collections/modio", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toContain("/collections/laptops");

    await page.goto("/collections/modio");
    await expect(page).toHaveURL(/\/collections\/laptops$/);
    await expect(page.locator("h1")).toHaveText("Laptops");
  });

  test("a renamed product redirects to its current page", async ({ page }) => {
    await page.goto("/products/old-elitebook-name");
    await expect(page).toHaveURL(/\/products\/hp-elitebook-830-g5$/);
  });

  test("any other unknown path redirects when a manual redirect exists", async ({ page }) => {
    await page.goto("/legacy-page");
    await expect(page).toHaveURL(/\/shop$/);
  });

  test("unknown product and collection URLs still give a real 404", async ({ request }) => {
    for (const path of ["/products/does-not-exist", "/collections/does-not-exist", "/nothing/here"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(404);
    }
  });

  test("legacy Wix product ids redirect permanently to search", async ({ request }) => {
    const response = await request.get("/products/id/abc123", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toContain("/shop?q=abc123");
  });
});
