import { expect, test } from "@playwright/test";

test.describe("auth pages", () => {
  test("register, forgot-password and reset-password are real pages with one H1", async ({ page }) => {
    for (const path of ["/login", "/register", "/forgot-password", "/reset-password?token=" + "a".repeat(64)]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1"), path).toHaveCount(1);
      expect(await page.locator('meta[name="robots"]').getAttribute("content"), path).toContain("noindex");
    }
  });

  test("login shows the API error inline and links to forgot password and register", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
    await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", /\/register/);

    await page.getByLabel("Email").fill("amina@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Invalid email or password");
  });

  test("password field can be shown and hidden", async ({ page }) => {
    await page.goto("/login");
    const input = page.getByLabel("Password", { exact: true });
    await expect(input).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(input).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("register rejects a non-Kenyan phone number before calling the API", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Amina");
    await page.getByLabel("Email").fill("amina@example.com");
    await page.getByLabel("Phone (optional)").fill("12345");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Kenyan mobile number");
  });

  test("register shows an existing-email error from the API", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Amina");
    await page.getByLabel("Email").fill("taken@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Email already registered");
  });

  test("forgot password confirms without revealing whether the account exists", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("anyone@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("If an account exists");
  });

  test("reset password: mismatch, expired link and success", async ({ page }) => {
    await page.goto("/reset-password?token=" + "e".repeat(8) + "x".repeat(56));
    await page.getByLabel("New password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm new password").fill("different123");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("do not match");

    // expired token: mock treats tokens starting with "expired" as invalid
    await page.goto("/reset-password?token=expired" + "x".repeat(60));
    await page.getByLabel("New password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm new password").fill("password123");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("invalid or has expired");

    await page.goto("/reset-password?token=" + "a".repeat(64));
    await page.getByLabel("New password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm new password").fill("password123");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByRole("heading", { name: "Password changed" })).toBeVisible();
  });

  test("a reset page without a token explains the problem", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "This link is not valid" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a new link" })).toBeVisible();
  });
});
