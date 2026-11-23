import { expect, test } from "@playwright/test";

test("a progress bar shows while moving between pages", async ({ page }) => {
  await page.goto("/shop");
  // slow the next page's data so the bar is on screen long enough to see
  await page.route(/_rsc=/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await expect(page.locator("#nprogress")).toHaveCount(0);

  await page.getByRole("link", { name: "Track your order" }).first().click();
  await expect(page.locator("#nprogress .bar")).toBeAttached();
  await expect(page).toHaveURL(/\/track$/);
  // and it goes away once the page has loaded
  await expect(page.locator("#nprogress")).toHaveCount(0);
});
