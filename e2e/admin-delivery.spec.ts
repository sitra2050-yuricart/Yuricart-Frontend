import { expect, test, type Page } from "@playwright/test";

const API = "http://localhost:8100";
// The admin API sends cookies (credentials: include), so CORS cannot use "*":
// the origin is echoed back and credentials are allowed.
const cors = {
  "access-control-allow-origin": "http://localhost:3100",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

interface Rule {
  _id: string;
  name: string;
  rate: number;
  freeAbove?: number;
  regions: string[];
  status: "active" | "inactive";
}

/** Signs in as an admin and fakes the delivery-rules API, recording what the page sends. */
async function stubAdmin(page: Page, seed: Rule[] = []) {
  const rules = [...seed];
  const sent = { create: [] as any[], update: [] as any[], remove: [] as string[] };
  let nextId = 1;

  await page.addInitScript(() => localStorage.setItem("yuricart_admin_token", "test-token"));

  await page.route(`${API}/**`, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();

    if (!path.startsWith("/admin/")) return route.fallback();
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: cors });

    const reply = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        headers: { ...cors, "content-type": "application/json" },
        body: JSON.stringify({
          success: true,
          data,
          meta: { page: 1, limit: 100, total: rules.length, totalPages: 1 },
        }),
      });

    if (path === "/admin/auth/me") {
      return reply({ id: "a1", name: "Admin", email: "admin@example.com", role: "admin" });
    }
    if (path === "/admin/shipping" && method === "GET") return reply(rules);

    if (path === "/admin/shipping" && method === "POST") {
      const body = req.postDataJSON();
      sent.create.push(body);
      const { freeAbove, ...rest } = body;
      const rule = { _id: `r${nextId++}`, ...rest, ...(freeAbove ? { freeAbove } : {}) } as Rule;
      rules.push(rule);
      return reply(rule, 201);
    }

    const match = path.match(/^\/admin\/shipping\/(.+)$/);
    if (match && method === "PATCH") {
      const body = req.postDataJSON();
      sent.update.push({ id: match[1], body });
      const rule = rules.find((r) => r._id === match[1])!;
      const { freeAbove, ...rest } = body;
      Object.assign(rule, rest);
      if (freeAbove === null) delete rule.freeAbove;
      else if (freeAbove !== undefined) rule.freeAbove = freeAbove;
      return reply(rule);
    }
    if (match && method === "DELETE") {
      sent.remove.push(match[1]);
      rules.splice(rules.findIndex((r) => r._id === match[1]), 1);
      return reply({ id: match[1] });
    }
    return route.fulfill({ status: 404, headers: cors, body: JSON.stringify({ success: false, message: "stub: not found" }) });
  });

  return sent;
}

const dialog = (page: Page) => page.getByRole("dialog");
const heading = (page: Page) => page.getByRole("heading", { name: "Delivery", level: 1 });

async function addRule(page: Page, v: { name: string; fee: string; free?: string; areas?: string }) {
  await page.getByRole("button", { name: "Add delivery rule" }).click();
  await dialog(page).getByLabel("Name").fill(v.name);
  await dialog(page).getByLabel("Delivery fee (KES)").fill(v.fee);
  if (v.free) await dialog(page).getByLabel("Free delivery from (KES)").fill(v.free);
  if (v.areas) await dialog(page).getByLabel("Areas").fill(v.areas);
  await dialog(page).getByRole("button", { name: "Save rule" }).click();
  await expect(dialog(page)).toBeHidden();
}

test.describe("admin delivery rules", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "the admin is a desktop tool"));

  test("with no rules it says orders are charged no delivery, and the nav link exists", async ({ page }) => {
    await stubAdmin(page);
    await page.goto("/admin/delivery");

    await expect(heading(page)).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "No delivery rules yet" })).toBeVisible();
    await expect(page.getByText("Add your first rule")).toBeVisible();
    await expect(page.getByRole("link", { name: "Delivery" }).first()).toHaveAttribute("href", "/admin/delivery");
  });

  test("adding rules sends the right data and the warnings follow the rule set", async ({ page }) => {
    const sent = await stubAdmin(page);
    await page.goto("/admin/delivery");

    // an areas-only rule: orders from other cities would get the cheapest fee
    await addRule(page, { name: "Nairobi", fee: "300", free: "50000", areas: "Nairobi\nNairobi CBD" });
    await expect(page.getByText("Applies to: Nairobi, Nairobi CBD")).toBeVisible();
    await expect(page.getByText("free over Kes 50,000")).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "No delivery rules yet" })).toHaveCount(0);
    await expect(page.getByRole("alert").filter({ hasText: "No “everywhere else” rule" })).toBeVisible();

    // adding the catch-all clears that warning
    await addRule(page, { name: "Countrywide", fee: "800" });
    await expect(page.getByText("Everywhere else", { exact: true })).toBeVisible();
    // (Next adds an empty alert region for route changes; count only real warnings)
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0);

    expect(sent.create).toEqual([
      { name: "Nairobi", rate: 300, freeAbove: 50000, regions: ["Nairobi", "Nairobi CBD"], status: "active" },
      { name: "Countrywide", rate: 800, freeAbove: null, regions: [], status: "active" },
    ]);
  });

  test("a bad form is explained and nothing is sent", async ({ page }) => {
    const sent = await stubAdmin(page);
    await page.goto("/admin/delivery");

    await page.getByRole("button", { name: "Add delivery rule" }).click();
    await dialog(page).getByRole("button", { name: "Save rule" }).click();

    await expect(dialog(page).getByText("Give the rule a name")).toBeVisible();
    await expect(dialog(page).getByText("Enter the delivery fee")).toBeVisible();
    await dialog(page).getByLabel("Name").fill("X");
    await dialog(page).getByLabel("Delivery fee (KES)").fill("100");
    await dialog(page).getByLabel("Free delivery from (KES)").fill("0");
    await dialog(page).getByRole("button", { name: "Save rule" }).click();
    await expect(dialog(page).getByText(/above 0/)).toBeVisible();
    expect(sent.create).toHaveLength(0);
  });

  test("clearing the free-delivery threshold removes it instead of saving zero", async ({ page }) => {
    const sent = await stubAdmin(page, [
      { _id: "r1", name: "Nairobi", rate: 300, freeAbove: 50000, regions: ["Nairobi"], status: "active" },
    ]);
    await page.goto("/admin/delivery");
    await expect(page.getByText("free over Kes 50,000")).toBeVisible();

    await page.getByRole("button", { name: /Edit Nairobi/ }).click();
    await expect(dialog(page).getByLabel("Free delivery from (KES)")).toHaveValue("50000");
    await dialog(page).getByLabel("Free delivery from (KES)").fill("");
    await dialog(page).getByRole("button", { name: "Save rule" }).click();
    await expect(dialog(page)).toBeHidden();

    expect(sent.update).toEqual([
      { id: "r1", body: { name: "Nairobi", rate: 300, freeAbove: null, regions: ["Nairobi"], status: "active" } },
    ]);
    await expect(page.getByText("free over")).toHaveCount(0);
  });

  test("an inactive rule is marked and a delete asks first", async ({ page }) => {
    const sent = await stubAdmin(page, [
      { _id: "r1", name: "Old rule", rate: 100, regions: [], status: "inactive" },
      { _id: "r2", name: "Rest", rate: 800, regions: [], status: "active" },
    ]);
    await page.goto("/admin/delivery");
    await expect(page.getByText("inactive", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Delete Old rule/ }).click();
    await expect(dialog(page).getByText("Delete this delivery rule?")).toBeVisible();
    await dialog(page).getByRole("button", { name: "Cancel" }).click();
    expect(sent.remove).toHaveLength(0);

    await page.getByRole("button", { name: /Delete Old rule/ }).click();
    await dialog(page).getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Old rule")).toHaveCount(0);
    expect(sent.remove).toEqual(["r1"]);
  });

  test("the fee checker shows what checkout would charge", async ({ page }) => {
    await stubAdmin(page);
    await page.goto("/admin/delivery");

    await page.getByLabel("City").fill("Nairobi");
    await page.getByLabel("Order total (KES)").fill("20000");
    await page.getByRole("button", { name: "Check fee" }).click();
    // the mock API prices Nairobi at 200
    await expect(page.getByText("Kes 200")).toBeVisible();
    await expect(page.getByText("(Nairobi)")).toBeVisible();

    await page.getByLabel("City").fill("Norules");
    await page.getByRole("button", { name: "Check fee" }).click();
    await expect(page.getByText("No rule applies.")).toBeVisible();
  });
});
