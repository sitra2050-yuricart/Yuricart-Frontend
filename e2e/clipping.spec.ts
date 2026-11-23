import { expect, test, type Page } from "@playwright/test";

/**
 * Finds borders and rings that are cut off. Chips and cards draw their border
 * as a 1px box-shadow ring (Tailwind ring-1), and focus rings are 2px. Inside a
 * scroll container (overflow-x: auto also clips vertically) a ring on the edge
 * of the content box is clipped, which looked like a missing top border.
 */
async function findClippedRings(page: Page) {
  return page.evaluate(() => {
    type Hit = { element: string; clippedBy: string; side: string; by: number };
    const hits: Hit[] = [];
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(/\s+/).slice(0, 3).join(".") : ""}`;

    // Spread of a ring-style shadow: "rgba(...) 0px 0px 0px 1px" (no blur).
    const ringSpread = (shadow: string) => {
      let max = 0;
      for (const m of shadow.matchAll(/(-?\d+(?:\.\d+)?)px (-?\d+(?:\.\d+)?)px (\d+(?:\.\d+)?)px (\d+(?:\.\d+)?)px/g)) {
        const [, x, y, blur, spread] = m.map(Number) as number[];
        if (x === 0 && y === 0 && blur === 0) max = Math.max(max, spread);
      }
      return max;
    };

    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const spread = ringSpread(style.boxShadow);
      // a focus ring may appear on interactive elements, so reserve room for it
      const interactive = el.matches("a,button,input,select,textarea,[tabindex]");
      const need = Math.max(spread, interactive ? 2 : 0);
      if (need === 0) continue;

      for (let anc = el.parentElement; anc && anc !== document.body; anc = anc.parentElement) {
        const a = getComputedStyle(anc);
        const clipsY = a.overflowY !== "visible";
        const clipsX = a.overflowX !== "visible";
        if (!clipsX && !clipsY) continue;
        const box = anc.getBoundingClientRect();

        const sides: Array<[string, number]> = [];
        if (clipsY) {
          sides.push(["top", box.top - (rect.top - need)]);
          sides.push(["bottom", rect.bottom + need - box.bottom]);
        }
        // Left/right only matter for items sitting inside the visible width;
        // content scrolled out of view is supposed to be cut.
        if (clipsX && rect.left >= box.left - 0.5 && rect.right <= box.right + 0.5) {
          sides.push(["left", box.left - (rect.left - need)]);
          sides.push(["right", rect.right + need - box.right]);
        }
        for (const [side, overflow] of sides) {
          if (overflow > 0.5) {
            hits.push({ element: describe(el), clippedBy: describe(anc), side, by: Math.round(overflow * 10) / 10 });
          }
        }
        // an overflow:hidden ancestor that is itself rounded media (images) is fine; stop at the first clipper
        break;
      }
    }
    return hits;
  });
}

const PAGES = ["/", "/shop", "/categories", "/collections/laptops", "/products/hp-elitebook-830-g5", "/offers", "/brands", "/contact", "/faq", "/track", "/login"];

for (const path of PAGES) {
  test(`no border or focus ring is clipped on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Measure only after fonts and images settle, or layout is still moving.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      Array.from(document.images).every((img) => img.complete),
    );
    expect(await findClippedRings(page)).toEqual([]);
  });
}

test("the detector really catches a clipped pill (guards the guard)", async ({ page }) => {
  await page.goto("/shop");
  // Recreate the old bug: no room above the chips inside the scroller.
  await page.addStyleTag({
    content: 'nav[aria-label="Shop by category"] { padding-top: 0 !important; }',
  });
  const hits = await findClippedRings(page);
  expect(hits.some((h) => h.side === "top")).toBe(true);
});
