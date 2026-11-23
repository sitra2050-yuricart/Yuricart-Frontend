import { expect, test } from "@playwright/test";

test.describe("finding an order without logging in", () => {
  test("a link from an email opens the order straight away", async ({ page }) => {
    await page.goto("/track?orderNumber=YC-20261123-0009&token=good-token");

    await expect(page.getByRole("heading", { name: "Order YC-20261123-0009" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Order progress" })).toBeVisible();
    // the delivery details are shown (they used to come back empty)
    await expect(page.getByText("Moi Avenue 1")).toBeVisible();
    await expect(page.getByText("Nairobi", { exact: true })).toBeVisible();
  });

  test("a link with a bad token explains it and shows no order", async ({ page }) => {
    await page.goto("/track?orderNumber=YC-20261123-0009&token=bad-token");

    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("could not find an order");
    await expect(page.getByRole("heading", { name: /^Order YC-/ })).toHaveCount(0);
  });

  test("lost order: asking by email gives the same neutral answer", async ({ page }) => {
    await page.goto("/track");

    await expect(page.getByRole("heading", { name: "Can't find your order?" })).toBeVisible();
    await page.getByLabel("Send the list to").fill("someone@example.com");
    await page.getByRole("button", { name: "Email me my orders" }).click();
    await expect(page.getByRole("status")).toContainText("If we have orders for that email");
  });
});

test.describe("confirming an email address", () => {
  test("a good link confirms and points to the orders", async ({ page }) => {
    await page.goto("/verify-email?token=" + "a".repeat(64));

    await expect(page.getByRole("heading", { name: "Email confirmed" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View your orders" })).toHaveAttribute("href", "/profile");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
  });

  test("an expired or missing link says so", async ({ page }) => {
    await page.goto("/verify-email?token=expired" + "b".repeat(60));
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("invalid or has expired");

    await page.goto("/verify-email");
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("missing or incomplete");
  });
});
