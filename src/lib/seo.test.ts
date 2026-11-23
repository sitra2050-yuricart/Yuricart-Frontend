import { describe, expect, it } from "vitest";
import { PRODUCTION_SITE_URL, resolveSiteUrl } from "./seo";

describe("resolveSiteUrl", () => {
  it("uses the configured production URL and strips trailing slashes", () => {
    expect(resolveSiteUrl("https://www.yuricart.com/")).toBe(
      "https://www.yuricart.com",
    );
  });

  it("never returns a vercel.app host", () => {
    expect(resolveSiteUrl("https://yuricart-frontend-chi.vercel.app")).toBe(
      PRODUCTION_SITE_URL,
    );
  });

  it("falls back for empty or invalid values", () => {
    expect(resolveSiteUrl("")).toBe(PRODUCTION_SITE_URL);
    expect(resolveSiteUrl(undefined)).toBe(PRODUCTION_SITE_URL);
    expect(resolveSiteUrl("not a url")).toBe(PRODUCTION_SITE_URL);
  });

  it("keeps localhost for local development", () => {
    expect(resolveSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });
});
