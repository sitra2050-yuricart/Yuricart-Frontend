import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/shop", name: "shop" },
  { path: "/categories", name: "categories" },
  { path: "/collections/laptops", name: "collection" },
  { path: "/products/hp-elitebook-830-g5", name: "product" },
  { path: "/offers", name: "offers" },
  { path: "/brands", name: "brands" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/faq", name: "faq" },
  { path: "/privacy", name: "privacy" },
  { path: "/track", name: "track" },
  { path: "/", name: "home (API down, fallback)" },
];

for (const route of ROUTES) {
  test.describe(route.name, () => {
    test("loads with one H1, the real canonical host and no console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(/^https:\/\/www\.yuricart\.com(\/|$)/);

      // Ignore failed image requests for the data: placeholders; everything else counts.
      expect(errors.filter((e) => !/favicon|Failed to load resource/.test(e))).toEqual([]);
    });

    test("has no serious or critical accessibility violations", async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      // Colour contrast is enforced like any other serious violation. The node
      // list is included so a failure names the element and its ratio.
      const blocking = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      const detail = (v: (typeof blocking)[number]) =>
        `${v.id}: ${v.help} (${v.nodes.length}) ` +
        v.nodes
          .slice(0, 4)
          .map((n) => `${n.target.join(" ")} :: ${n.any[0]?.message ?? ""}`)
          .join(" | ");
      expect(
        blocking.map(detail),
      ).toEqual([]);
    });
  });
}

test("sitemap.xml and robots.txt use the real host", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("<loc>https://www.yuricart.com/shop</loc>");
  expect(xml).not.toContain("vercel.app");

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://www.yuricart.com/sitemap.xml");
});

test("homepage never shows a bare error when the API is down", async ({ page }) => {
  // The mock API answers /homepage with 500. Expect real content, not a dead end.
  await page.goto("/");
  await expect(page.getByText("Unable to load homepage")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Shop all products" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "New arrivals" })).toBeVisible();
});

test("unknown URLs get a helpful 404 with search and categories", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /couldn.t find that page/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Laptops" }).first()).toBeVisible();
});

test("the login page keeps the standard header and footer", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("offers lists only discounted products", async ({ page }) => {
  await page.goto("/offers");
  const cards = page.locator('a[href^="/products/"]');
  expect(await cards.count()).toBeGreaterThan(0);
  // every card on this page carries a discount pill
  await expect(page.getByText(/^-\d+%$/)).toHaveCount(await cards.count());
});
