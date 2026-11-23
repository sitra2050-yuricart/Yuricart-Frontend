import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * End-to-end checks run against a production build served on PORT. Storefront
 * data comes from a mock API (e2e/mock-api.mjs) so the tests need no backend.
 * Build first with the same env (NEXT_PUBLIC_* values are baked in at build):
 *   NEXT_PUBLIC_API_URL=http://localhost:8100 NEXT_PUBLIC_BASE_URL=https://www.yuricart.com npm run build
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Locally reuse the installed Chrome; CI installs Playwright's Chromium.
    channel: process.env.CI ? undefined : "chrome",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node e2e/mock-api.mjs",
      port: 8100,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npx next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_URL: "http://localhost:8100",
        NEXT_PUBLIC_BASE_URL: "https://www.yuricart.com",
        NEXT_PUBLIC_META_PIXEL_ID: "0",
      },
    },
  ],
});
