import { expect, test, type Page } from "@playwright/test";

const drawer = (page: Page) => page.getByRole("dialog");

// Retries the click: right after a navigation the button can exist before the page has
// finished loading, and an early click does nothing.
const openCart = (page: Page) =>
  expect(async () => {
    if (!(await drawer(page).isVisible())) {
      await page.locator('button[aria-label^="Open cart"]:visible').first().click();
    }
    await expect(drawer(page)).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 10_000 });
const checkoutButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Checkout" });

async function addToCart(page: Page) {
  await page.goto("/products/hp-elitebook-830-g5");
  await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
}

/** A cart saved in the browser, as the store persists it. */
async function seedCart(page: Page, items: Array<Record<string, unknown>>) {
  await page.addInitScript((saved) => {
    localStorage.setItem("yuricart-cart", JSON.stringify({ state: { items: saved }, version: 0 }));
  }, items);
}

const line = (over: Record<string, unknown>) => ({
  lineId: "p1",
  productId: "p1",
  slug: "hp-elitebook-830-g5",
  title: "HP EliteBook 830 G5",
  price: 28000,
  quantity: 1,
  currency: "KES",
  stock: 5,
  ...over,
});

test.describe("cart drawer checkout button", () => {
  test("is usable again after going to checkout and back to the shop", async ({ page }) => {
    await addToCart(page);
    await page.goto("/shop");

    await openCart(page);
    await checkoutButton(page).click();
    await expect(page).toHaveURL(/\/checkout$/);

    // back to shopping, then open the cart again
    await page.getByRole("link", { name: "Continue shopping" }).first().click();
    await expect(page).toHaveURL(/\/shop$/);
    await openCart(page);

    await expect(checkoutButton(page)).toBeEnabled();
    await expect(checkoutButton(page).locator(".animate-spin")).toHaveCount(0);
  });

  test("on the checkout page it just closes the cart and stays usable", async ({ page }) => {
    await addToCart(page);
    await page.goto("/checkout");

    await openCart(page);
    await checkoutButton(page).click();
    await expect(drawer(page)).toBeHidden();

    await openCart(page);
    await expect(checkoutButton(page)).toBeEnabled();
    await expect(checkoutButton(page).locator(".animate-spin")).toHaveCount(0);
  });
});

test.describe("items without a price", () => {
  test("show as price on request and block checkout until removed", async ({ page }) => {
    await seedCart(page, [
      line({}),
      line({ lineId: "p2", productId: "p2", slug: "hp-deskjet-aio-2875", title: "HP DeskJet AIO 2875", price: 0 }),
    ]);
    await page.goto("/shop");
    await openCart(page);

    await expect(drawer(page).getByText("Price on request")).toBeVisible();
    await expect(drawer(page).getByText("KES 0.00")).toHaveCount(0);
    await expect(checkoutButton(page)).toBeDisabled();
    await expect(drawer(page).getByText(/Remove items without a price/)).toBeVisible();

    await drawer(page).getByRole("button", { name: /Remove HP DeskJet AIO 2875/ }).click();
    await expect(checkoutButton(page)).toBeEnabled();
    await expect(drawer(page).getByText(/Remove items without a price/)).toHaveCount(0);
  });
});
