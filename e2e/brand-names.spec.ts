import { expect, test } from "@playwright/test";

// The mock brands are stored as "hp", "DELL" and "LENOVO", and "hp" has an image saved.
test.describe("brand names", () => {
  test("the brands page shows tidy names and no brand image", async ({ page }) => {
    await page.goto("/brands");

    const tiles = page.locator('main a[href^="/shop?brand="]');
    await expect(tiles.first()).toBeVisible();
    await expect(tiles).toHaveCount(3);
    // each tile's name is its last text line before the product count
    const names = await tiles.evaluateAll((els) =>
      els.map((el) => (el.querySelector("span.text-sm") as HTMLElement | null)?.innerText.trim() ?? ""),
    );
    expect(names).toEqual(["HP", "Dell", "Lenovo"]);
    await expect(page.locator("main img")).toHaveCount(0);
  });

  test("the shop filter and its chip use the same names", async ({ page }) => {
    await page.goto("/shop?brand=dell");
    await expect(page.getByRole("button", { name: "Remove filter: Dell" })).toBeVisible();

    const options = await page.getByLabel("Brand").locator("option").allInnerTexts();
    expect(options).toEqual(["All brands", "HP", "Dell", "Lenovo"]);
  });
});
