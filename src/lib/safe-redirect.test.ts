import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/checkout")).toBe("/checkout");
    expect(safeNextPath("/products/abc?x=1")).toBe("/products/abc?x=1");
  });

  it("falls back for external or malformed targets", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "evil.com", "", null, undefined]) {
      expect(safeNextPath(bad as string)).toBe("/profile");
    }
  });
});
