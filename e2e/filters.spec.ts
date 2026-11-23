import { expect, test } from "@playwright/test";

// Mock data: 24 products over HP, Dell and Lenovo (8 each); 3 are sold out, so
// 21 are in stock. Epson is a brand with no products and must stay hidden.

const found = (page: import("@playwright/test").Page) =>
  page.getByText(/^\d+ products? found$/);

test.describe("desktop filters", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "desktop layout"));

  test("filter by brand, shown as a removable chip", async ({ page }) => {
    await page.goto("/shop");
    await expect(found(page)).toContainText("24");

    await page.getByLabel("Brand").selectOption("dell");
    await expect(page).toHaveURL(/brand=dell/);
    await expect(found(page)).toContainText("8");

    const chips = page.getByRole("list", { name: "Applied filters" });
    await expect(chips.getByRole("button", { name: "Remove filter: Dell" })).toBeVisible();
    await chips.getByRole("button", { name: "Remove filter: Dell" }).click();
    await expect(page).not.toHaveURL(/brand=/);
    await expect(found(page)).toContainText("24");
  });

  test("brands with no products are not offered", async ({ page }) => {
    await page.goto("/shop");
    const options = await page.getByLabel("Brand").locator("option").allTextContents();
    expect(options).toEqual(["All brands", "HP", "Dell", "Lenovo"]);
  });

  test("in-stock only hides sold-out products and survives Load more", async ({ page }) => {
    await page.goto("/shop");
    await page.getByLabel("In stock only").check();
    await expect(page).toHaveURL(/in_stock=1/);
    await expect(found(page)).toContainText("21");

    await page.getByRole("button", { name: "Load more" }).click();
    await expect(page.getByText("Showing 21 of 21")).toBeVisible();
    await expect(page.getByText("Out of stock")).toHaveCount(0);
  });

  test("filters combine and Clear all resets them", async ({ page }) => {
    await page.goto("/shop?brand=hp&in_stock=1");
    // HP has 8 products; product index 3 is not HP-sold-out? (index % 3 === 0 are HP: 0,3,6,...)
    // index 3 is HP and sold out, so 7 HP products are in stock.
    await expect(found(page)).toContainText("7");

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(found(page)).toContainText("24");
  });

  test("no results offers to clear the filters", async ({ page }) => {
    await page.goto("/shop?price_min=900000");
    await expect(page.getByText("No products found")).toBeVisible();
    await page.getByRole("link", { name: "Clear filters" }).click();
    await expect(found(page)).toContainText("24");
  });
});

test.describe("phone filter sheet", () => {
  test.beforeEach(({ isMobile }) => test.skip(!isMobile, "phone layout"));

  test("filters collapse into one button and apply together", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByLabel("Minimum price")).toBeHidden();

    await page.getByRole("button", { name: /Filter & sort/ }).click();
    const sheet = page.getByRole("dialog", { name: "Filter & sort" });
    await expect(sheet).toBeVisible();

    await sheet.getByLabel("Brand").selectOption("lenovo");
    await sheet.getByLabel("In stock only").check();
    // nothing is applied until Show results
    await expect(page).not.toHaveURL(/brand=/);
    await sheet.getByRole("button", { name: "Show results" }).click();

    await expect(page).toHaveURL(/brand=lenovo/);
    await expect(page).toHaveURL(/in_stock=1/);
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("button", { name: /2 active filters/ })).toBeVisible();
    // Lenovo has 8 products, one of them sold out
    await expect(found(page)).toContainText("7");
  });

  test("Escape closes the sheet without applying anything", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: /Filter & sort/ }).click();
    const sheet = page.getByRole("dialog", { name: "Filter & sort" });
    await sheet.getByLabel("Brand").selectOption("dell");
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page).not.toHaveURL(/brand=/);
  });
});

test.describe("brands page", () => {
  test("lists brands that have products and links to the filtered shop", async ({ page }) => {
    await page.goto("/brands");
    await expect(page.getByRole("heading", { name: "Shop by brand", level: 1 })).toBeVisible();
    for (const name of ["HP", "Dell", "Lenovo"]) {
      await expect(page.getByRole("link", { name: new RegExp(`^${name}`) })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /^Epson/ })).toHaveCount(0);

    await page.getByRole("link", { name: /^Dell/ }).click();
    await expect(page).toHaveURL(/\/shop\?brand=dell/);
    await expect(found(page)).toContainText("8");
  });

  test("is in the sitemap", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/brands");
  });
});
