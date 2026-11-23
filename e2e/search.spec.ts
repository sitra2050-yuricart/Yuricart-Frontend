import { expect, test, type Page } from "@playwright/test";

const box = (page: Page) => page.getByRole("combobox", { name: "Search products" }).first();
const list = (page: Page) => page.getByRole("listbox", { name: "Product suggestions" });

test.describe("search suggestions", () => {
  test("typing shows matching products with image, name and price", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("hp");

    await expect(list(page)).toBeVisible();
    const first = list(page).getByRole("option").first();
    await expect(first).toContainText("HP");
    await expect(first).toContainText(/KES/);
    await expect(first.locator("img")).toBeVisible();
    await expect(list(page).getByRole("option", { name: /See all results for “hp”/ })).toHaveAttribute("href", "/shop?q=hp");
  });

  test("a word beginning is enough, and one letter does not search yet", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("e");
    await expect(list(page)).toHaveCount(0);

    await box(page).fill("elite");
    await expect(list(page).getByRole("option").first()).toContainText(/EliteBook/i);
  });

  test("choosing a product opens it", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("elite");
    const option = list(page).getByRole("option").first();
    const href = await option.getAttribute("href");
    await option.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("arrow keys move through the list, Enter opens the highlighted product", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("hp");
    await expect(list(page).getByRole("option").first()).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(list(page).getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await expect(box(page)).toHaveAttribute("aria-activedescendant", /-opt-0$/);
    const href = await list(page).getByRole("option").first().getAttribute("href");

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("Enter with nothing highlighted runs the full search", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("printer");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/shop\?q=printer$/);
  });

  test("Escape closes the list and keeps the text", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("hp");
    await expect(list(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(list(page)).toHaveCount(0);
    await expect(box(page)).toHaveValue("hp");
  });

  test("clicking elsewhere closes the list", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("hp");
    await expect(list(page)).toBeVisible();
    await page.mouse.click(4, 400); // empty page edge, outside the search box
    await expect(list(page)).toHaveCount(0);
  });

  test("no match explains it; a failed lookup still offers the full search", async ({ page }) => {
    await page.goto("/");
    await box(page).fill("zzzzzz");
    await expect(list(page)).toContainText("No products match");

    await box(page).fill("boom");
    await expect(list(page)).toContainText("could not load suggestions");
    await expect(list(page).getByRole("option", { name: /See all results/ })).toBeVisible();
  });
});

test.describe("clearing a search", () => {
  test("the clear button empties the box and keeps focus there", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Clear search" })).toHaveCount(0);

    await box(page).fill("hp");
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(box(page)).toHaveValue("");
    await expect(box(page)).toBeFocused();
    await expect(page.getByRole("button", { name: "Clear search" })).toHaveCount(0);
    await expect(list(page)).toHaveCount(0);
  });

  test("the results page keeps the search text in the box and can be cleared", async ({ page }) => {
    await page.goto("/shop?q=hp");
    await expect(box(page)).toHaveValue("hp");

    await page.getByRole("link", { name: "Clear search" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(box(page)).toHaveValue("");
    await expect(page.getByRole("heading", { level: 1, name: "All products" })).toBeVisible();
  });
});
