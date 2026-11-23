import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.addInitScript(() => localStorage.setItem("yuricart_customer_token", "test-customer"));
}

test.describe("sign-in screens", () => {
  for (const path of ["/login", "/register", "/forgot-password"]) {
    test(`${path} has no site header or footer, but a way back to the store`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("banner")).toHaveCount(0);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Back to store" })).toHaveAttribute("href", "/");
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }
});

test.describe("account control in the header", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "the header account control is the desktop one"));

  test("signed out it is one link to log in or sign up", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("banner").getByRole("link", { name: "Log in / Sign up" });
    await expect(link).toHaveAttribute("href", "/login");
    await link.click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signed in it shows the name, and the whole control opens the menu", async ({ page }) => {
    await signIn(page);
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Account menu for Amina" });
    await expect(trigger).toContainText("Amina");
    // clicking the name, not just the icon, opens it
    await trigger.getByText("Amina", { exact: true }).click();

    const menu = page.getByRole("menu");
    await expect(menu).toContainText("Amina Wanjiru");
    await expect(menu).toContainText("amina@example.com");
    await expect(menu.getByRole("menuitem", { name: "My orders" })).toHaveAttribute("href", "/profile#orders");
    await expect(menu.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    await expect(menu.getByRole("menuitem", { name: "Log out" })).toBeVisible();
    // the old static label is gone
    await expect(page.getByRole("banner").getByText("Account", { exact: true })).toHaveCount(0);
  });
});

test.describe("profile", () => {
  test("shows who is signed in and orders as compact cards", async ({ page }) => {
    await signIn(page);
    await page.goto("/profile");

    await expect(page.getByRole("heading", { level: 1, name: "Amina Wanjiru" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();

    const card = page.getByRole("article").filter({ hasText: "YC-20261123-0001" });
    await expect(card).toContainText("On its way");
    await expect(card).toContainText("HP EliteBook 830 G5");
    await expect(card).toContainText("and 1 more");
    await expect(card).toContainText("KES 44,000");
    // compact: a card is a row, not a page
    const box = await card.boundingBox();
    expect(box!.height).toBeLessThan(190);

    await card.getByRole("link").click();
    await expect(page).toHaveURL(/checkout-success\?orderNumber=YC-20261123-0001/);
  });

  test("logged out it asks to log in and still offers tracking", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Log in to see your account" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Track your order" })).toHaveAttribute("href", "/track");
  });
});
