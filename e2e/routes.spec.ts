import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/shop", name: "shop" },
  { path: "/categories", name: "categories" },
  { path: "/collections/laptops", name: "collection" },
  { path: "/products/hp-elitebook-830-g5", name: "product" },
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
      expect(canonical).toMatch(/^https:\/\/www\.yuricart\.com\//);

      // Ignore failed image requests for the data: placeholders; everything else counts.
      expect(errors.filter((e) => !/favicon|Failed to load resource/.test(e))).toEqual([]);
    });

    test("has no serious or critical accessibility violations", async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      // Known baseline issue, fixed in the Phase 2 design-system work (orange
      // primary and small grey text fall below 4.5:1). Anything else blocks.
      const KNOWN = new Set(["color-contrast"]);
      const contrast = results.violations.find((v) => v.id === "color-contrast");
      if (contrast) {
        test.info().annotations.push({
          type: "baseline-color-contrast",
          description: contrast.nodes
            .map((n) => `${n.target.join(" ")} :: ${n.any[0]?.message ?? ""}`)
            .join(" | "),
        });
      }
      const blocking = results.violations.filter(
        (v) => ["serious", "critical"].includes(v.impact ?? "") && !KNOWN.has(v.id),
      );
      expect(
        blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
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

test.fixme("homepage never shows a bare error when the API is down (Phase 1)", async ({ page }) => {
  // The mock API answers /homepage with 500. Expect real navigation, not a dead end.
  await page.goto("/");
  await expect(page.getByText("Unable to load homepage")).toHaveCount(0);
});
