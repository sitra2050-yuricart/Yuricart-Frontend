import { expect, test } from "@playwright/test";

const PRODUCT_PATH = "/products/hp-elitebook-830-g5";
const MOCK = "http://localhost:8100";

async function addToCart(page: import("@playwright/test").Page) {
  await page.goto(PRODUCT_PATH);
  await page
    .locator("button:visible", { hasText: "Add to cart" })
    .first()
    .click();
}

test.describe("order flow (guest, cash on delivery)", () => {
  test("add to cart, check out, and see the confirmation", async ({ page, request }) => {
    await addToCart(page);

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    // the order summary lists what is in the cart, with a price
    await expect(page.getByText(/HP EliteBook 830 G5 x 1/)).toBeVisible();
    await expect(page.getByText(/Subtotal:/)).toBeVisible();

    await page.getByLabel("Full name").fill("Amina Wanjiru");
    await page.getByLabel("Email").fill("amina@example.com");
    await page.getByLabel("Phone (WhatsApp)").fill("0712345678");
    await page.getByLabel("Delivery address").fill("Moi Avenue, Bazaar Plaza");
    await page.getByLabel("City").fill("Nairobi");
    await page.getByRole("button", { name: "Place order" }).click();

    await expect(page).toHaveURL(/\/checkout-success\?orderNumber=YC-TEST-0001/);
    await expect(page.getByRole("heading", { name: "We received your order!" })).toBeVisible();
    await expect(page.getByText("YC-TEST-0001").first()).toBeVisible();

    // what the storefront actually sent to the API
    const { order } = await (await request.get(`${MOCK}/__last-order`)).json();
    expect(order.request).toMatchObject({
      customerName: "Amina Wanjiru",
      email: "amina@example.com",
      phone: "0712345678",
      address: "Moi Avenue, Bazaar Plaza",
      city: "Nairobi",
      paymentMethod: "cod",
    });
    expect(order.request.items).toHaveLength(1);
    expect(order.request.items[0].quantity).toBe(1);
    expect(order.request.items[0].productId).toBe(order.order.items[0].productId);
  });

  test("the cart is emptied after a successful order", async ({ page }) => {
    await addToCart(page);
    await page.goto("/checkout");
    await page.getByLabel("Full name").fill("Amina Wanjiru");
    await page.getByLabel("Email").fill("amina@example.com");
    await page.getByLabel("Phone (WhatsApp)").fill("0712345678");
    await page.getByLabel("Delivery address").fill("Moi Avenue");
    await page.getByLabel("City").fill("Nairobi");
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page).toHaveURL(/checkout-success/);

    await page.goto("/checkout");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("an order the API refuses shows its message and keeps the cart", async ({ page }) => {
    await addToCart(page);
    await page.goto("/checkout");
    await page.getByLabel("Full name").fill("Amina Wanjiru");
    await page.getByLabel("Email").fill("reject@example.com");
    await page.getByLabel("Phone (WhatsApp)").fill("0712345678");
    await page.getByLabel("Delivery address").fill("Moi Avenue");
    await page.getByLabel("City").fill("Nairobi");

    // The checkout reports errors with alert(); handle it inside the listener.
    const messages: string[] = [];
    page.on("dialog", async (dialog) => {
      messages.push(dialog.message());
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Place order" }).click();
    await expect.poll(() => messages.length).toBeGreaterThan(0);
    expect(messages[0]).toContain("out of stock");

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByText(/HP EliteBook 830 G5 x 1/)).toBeVisible();
  });

  test("checkout with an empty cart explains and links back to the shop", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/shop");
  });
});
