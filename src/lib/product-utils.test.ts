import { describe, expect, it } from "vitest";
import { getUnitPrice } from "./api/product-utils";
import { formatKes, parseSpecs } from "./product-specs";

describe("getUnitPrice", () => {
  it("uses a real discount", () => {
    expect(getUnitPrice({ price: 28000, salePrice: 25000 })).toBe(25000);
  });

  it("ignores a sale price of 0 (the old 'Kes 0' bug)", () => {
    expect(getUnitPrice({ price: 28000, salePrice: 0 })).toBe(28000);
  });

  it("ignores a sale price that is not below the regular price", () => {
    expect(getUnitPrice({ price: 28800, salePrice: 35000 })).toBe(28800);
    expect(getUnitPrice({ price: 100, salePrice: 100 })).toBe(100);
  });
});

describe("formatKes", () => {
  it("formats with a thousands separator", () => {
    expect(formatKes(28000)).toBe("Kes 28,000");
  });
});

describe("parseSpecs", () => {
  it("reads Label: value lines and skips shop and contact text", () => {
    const rows = parseSpecs(
      "<ul><li>Processor: Intel i7</li><li>RAM: 16GB</li><li>Location: Bazaar Plaza</li></ul>",
    );
    expect(rows.map((r) => r.label)).toEqual(["Processor", "RAM"]);
  });
});
