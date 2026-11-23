import { describe, expect, it } from "vitest";
import { isValidKenyanPhone, normalizeKenyanPhone } from "./phone";

describe("isValidKenyanPhone", () => {
  it("accepts common Kenyan formats", () => {
    for (const ok of ["0712345678", "0112345678", "+254712345678", "254712345678", "0712 345 678", "0712-345-678"]) {
      expect(isValidKenyanPhone(ok)).toBe(true);
    }
  });

  it("rejects numbers that are not Kenyan mobiles", () => {
    for (const bad of ["", "12345", "0612345678", "07123456", "+255712345678", "abc"]) {
      expect(isValidKenyanPhone(bad)).toBe(false);
    }
  });
});

describe("normalizeKenyanPhone", () => {
  it("returns 2547XXXXXXXX", () => {
    expect(normalizeKenyanPhone("0712 345 678")).toBe("254712345678");
    expect(normalizeKenyanPhone("+254712345678")).toBe("254712345678");
    expect(normalizeKenyanPhone("nope")).toBeNull();
  });
});
