import { expect, test } from "@playwright/test";

test.describe("keyboard and assistive technology", () => {
  test("a skip link is the first tab stop and moves focus to the content", async ({ page }) => {
    await page.goto("/shop");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("the search box has a name and a real submit button", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("search");
    await expect(search.getByRole("searchbox", { name: "Search products" })).toBeVisible();
    await search.getByRole("searchbox").fill("elitebook");
    await search.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/shop\?q=elitebook/);
  });

  test("every icon-only button and link has an accessible name", async ({ page }) => {
    for (const path of ["/", "/shop", "/products/hp-elitebook-830-g5"]) {
      await page.goto(path);
      const unnamed = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("a[href], button"))
          .filter((el) => el.offsetParent !== null || getComputedStyle(el).position === "fixed")
          .filter((el) => {
            const name =
              el.getAttribute("aria-label") ||
              el.getAttribute("aria-labelledby") ||
              el.textContent?.trim() ||
              el.querySelector("img[alt]:not([alt=''])")?.getAttribute("alt") ||
              el.getAttribute("title");
            return !name;
          })
          .map((el) => el.outerHTML.slice(0, 120)),
      );
      expect(unnamed, path).toEqual([]);
    }
  });

  test("the checkout can be completed with the keyboard alone", async ({ page, request }) => {
    await page.goto("/products/hp-elitebook-830-g5");
    await page.locator("button:visible", { hasText: "Add to cart" }).first().click();
    await page.goto("/checkout");

    await page.getByLabel("Full name").focus();
    await page.keyboard.type("Amina Wanjiru");
    await page.keyboard.press("Tab");
    await page.keyboard.type("amina@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type("0712345678");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Moi Avenue");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Nairobi");
    // payment method, then the submit button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Place order" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/checkout-success/);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("transitions and smooth scrolling are switched off", async ({ page }) => {
    await page.goto("/shop");
    const result = await page.evaluate(() => {
      const link = document.querySelector("a[href^='/products/']") as HTMLElement;
      const style = getComputedStyle(link);
      return {
        transition: parseFloat(style.transitionDuration),
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
      };
    });
    // 0.01ms is 0.00001s: effectively no animation
    expect(result.transition).toBeLessThan(0.001);
    expect(result.scroll).toBe("auto");
  });
});
