import { expect, test } from "@playwright/test";

const PATH = "/products/hp-elitebook-830-g5";

test.describe("WhatsApp order button on the product page", () => {
  test("is visible, tappable and opens a prefilled order message", async ({ page }) => {
    await page.goto(PATH);

    const button = page.getByRole("link", { name: "Buy via WhatsApp" });
    await expect(button).toBeVisible();

    const href = (await button.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    const message = decodeURIComponent(href.split("?text=")[1]);
    expect(message).toContain("I want to order this product");
    expect(message).toContain("HP EliteBook 830 G5");
    expect(message).toContain(PATH);

    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("sits in the bottom bar between Add to cart and Buy now without overlapping or leaving the screen", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "the bottom bar is the phone layout");
    for (const width of [360, 320]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto(PATH);

      const boxes = await Promise.all(
        ["Add to cart", "Buy via WhatsApp", "Buy now"].map(async (name) => {
          const el = page.getByRole(name === "Buy via WhatsApp" ? "link" : "button", { name: new RegExp(name, "i") }).first();
          await expect(el).toBeVisible();
          return (await el.boundingBox())!;
        }),
      );

      boxes.forEach((b) => {
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(width);
      });
      // left to right: Add to cart, WhatsApp, Buy now; each starts after the previous one ends
      for (let i = 1; i < boxes.length; i++) {
        expect(boxes[i].x).toBeGreaterThanOrEqual(boxes[i - 1].x + boxes[i - 1].width - 0.5);
      }
    }
  });

  test("on larger screens the buttons stack as Add to cart, WhatsApp, Buy now", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout");
    await page.goto(PATH);
    const ys = await Promise.all(
      [
        page.getByRole("button", { name: /Add to cart/i }).first(),
        page.getByRole("link", { name: "Buy via WhatsApp" }),
        page.getByRole("button", { name: /Buy now/i }).first(),
      ].map(async (el) => (await el.boundingBox())!.y),
    );
    expect(ys[0]).toBeLessThan(ys[1]);
    expect(ys[1]).toBeLessThan(ys[2]);
  });

  test("on larger screens it keeps its full label", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout");
    await page.goto(PATH);
    await expect(page.getByRole("link", { name: "Buy via WhatsApp" })).toContainText("Buy via WhatsApp");
    const box = (await page.getByRole("link", { name: "Buy via WhatsApp" }).boundingBox())!;
    expect(box.width).toBeGreaterThan(120);
  });
});
