import { expect, test, type Page } from "@playwright/test";

const INFO_PAGES = [
  "about",
  "contact",
  "delivery",
  "warranty",
  "returns",
  "privacy",
  "terms",
  "how-to-buy",
  "faq",
];

test.describe("information pages", () => {
  for (const slug of INFO_PAGES) {
    test(`/${slug} exists, has one H1, real copy and is in the sitemap`, async ({ page, request }) => {
      const response = await page.goto(`/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const text = await page.locator("main").innerText();
      expect(text.length).toBeGreaterThan(200);
      expect(text).not.toMatch(/lorem ipsum/i);

      const xml = await (await request.get("/sitemap.xml")).text();
      expect(xml).toContain(`/${slug}</loc>`);
    });
  }

  test("contact shows WhatsApp and the shop address", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("main").getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute("href", /wa\.me\/\d+/);
    await expect(page.getByText("Bazaar Plaza, Moi Avenue").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute("href", /google\.com\/maps/);
  });

  test("the FAQ has structured data that matches the page", async ({ page }) => {
    await page.goto("/faq");
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json ?? "{}");
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.length).toBeGreaterThanOrEqual(5);
    // every question in the data is visible on the page
    for (const entity of data.mainEntity) {
      await expect(page.getByText(entity.name, { exact: true })).toBeVisible();
    }
  });

  test("the footer links to the help pages and policies", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    for (const [name, href] of [
      ["Delivery", "/delivery"],
      ["Warranty", "/warranty"],
      ["Returns", "/returns"],
      ["FAQ", "/faq"],
      ["Track your order", "/track"],
      ["Contact us", "/contact"],
      ["Privacy policy", "/privacy"],
      ["Terms of sale", "/terms"],
    ]) {
      await expect(footer.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
    }
  });
});

test.describe("SEO details", () => {
  test("the organisation is described as a local electronics store", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const org = blocks.map((b) => JSON.parse(b)).find((d) => String(d["@type"]).includes("Organization"));
    expect(org["@type"]).toContain("ElectronicsStore");
    expect(org.address.addressLocality).toBe("Nairobi");
    expect(org.address.addressCountry).toBe("KE");
    expect(org.sameAs.length).toBeGreaterThanOrEqual(3);
  });

  test("filtered and sorted lists are not indexed, the plain list is", async ({ page }) => {
    const robots = async (url: string) => {
      await page.goto(url);
      return (await page.locator('meta[name="robots"]').getAttribute("content")) ?? "";
    };
    expect(await robots("/shop")).toContain("index");
    expect(await robots("/shop")).not.toContain("noindex");
    for (const url of ["/shop?brand=hp", "/shop?in_stock=1", "/shop?sort=price_asc", "/collections/laptops?price_min=1000"]) {
      expect(await robots(url), url).toContain("noindex");
    }
  });

  test("the homepage shows the trust bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Delivery across Kenya", { exact: true })).toBeVisible();
  });
});

async function placeOrder(page: Page, city: string, payment?: string) {
  await page.goto("/products/hp-elitebook-830-g5");
  await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
  await page.goto("/checkout");
  await page.getByLabel("Full name").fill("Amina Wanjiru");
  await page.getByLabel("Email").fill("amina@example.com");
  await page.getByLabel("Phone (WhatsApp)").fill("0712345678");
  await page.getByLabel("Delivery address").fill("Moi Avenue");
  await page.getByLabel("City").fill(city);
  if (payment) {
    await page.getByLabel("Payment method").click();
    await page.getByRole("option", { name: payment }).click();
  }
}

test.describe("checkout totals", () => {
  test("delivery and the total appear once there is a city, and follow the zone", async ({ page }) => {
    await page.goto("/products/hp-elitebook-830-g5");
    await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
    await page.goto("/checkout");

    await expect(page.getByText("Enter your city below")).toBeVisible();

    await page.getByLabel("City").fill("Nairobi");
    await expect(page.getByText(/Delivery:/).locator("xpath=..")).toContainText("200");
    await expect(page.getByText(/Total:/).locator("xpath=..")).toContainText("28,200");

    await page.getByLabel("City").fill("Kisumu");
    await expect(page.getByText(/Delivery:/).locator("xpath=..")).toContainText("800");
    await expect(page.getByText(/Total:/).locator("xpath=..")).toContainText("28,800");
    await expect(page.getByText(/Free delivery on orders over/)).toBeVisible();
  });
});

test.describe("checkout when no delivery rules exist", () => {
  test("it does not claim delivery is free and keeps the subtotal as the total", async ({ page }) => {
    await page.goto("/products/hp-elitebook-830-g5");
    await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
    await page.goto("/checkout");
    await page.getByLabel("City").fill("Norules");

    await expect(page.getByText(/Delivery:/).locator("xpath=..")).toContainText("Confirmed when we contact you");
    await expect(page.getByText(/Delivery:/).locator("xpath=..")).not.toContainText("Free");
    await expect(page.getByText(/Total:/).locator("xpath=..")).toContainText("28,000");
    await expect(page.getByText(/We confirm the fee with you before dispatch/)).toBeVisible();
  });
});

test.describe("order confirmation and tracking", () => {
  test("an M-Pesa order says what happens next and never calls an STK API", async ({ page }) => {
    const stk: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/mpesa")) stk.push(r.url());
    });
    await placeOrder(page, "Nairobi", "M-Pesa (after order)");
    await page.getByRole("button", { name: "Place order" }).click();
    await page.getByRole("button", { name: "Continue as guest" }).click();

    await expect(page).toHaveURL(/checkout-success/);
    await expect(page.getByRole("heading", { name: "Next: pay with M-Pesa" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Message us on WhatsApp/ })).toHaveAttribute(
      "href",
      /wa\.me\/\d+\?text=.*YC-TEST-0001/,
    );
    expect(stk).toEqual([]);
  });

  test("tracking shows the order and its progress", async ({ page }) => {
    await placeOrder(page, "Nairobi");
    await page.getByRole("button", { name: "Place order" }).click();
    await page.getByRole("button", { name: "Continue as guest" }).click();
    await expect(page).toHaveURL(/checkout-success/);

    await page.goto("/track");
    await page.getByLabel("Order number").fill("YC-TEST-0001");
    await page.getByLabel("Email").fill("amina@example.com");
    await page.getByRole("button", { name: "Track order" }).click();

    await expect(page.getByRole("heading", { name: "Order YC-TEST-0001" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Order progress" })).toContainText("Order received");
    await expect(page.getByRole("listitem").filter({ hasText: "Order received" })).toHaveAttribute("aria-current", "step");
  });

  test("an unknown order explains how to fix it", async ({ page }) => {
    await page.goto("/track");
    await page.getByLabel("Order number").fill("YC-NOPE-0000");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByRole("button", { name: "Track order" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("could not find an order");
  });
});
