import { describe, expect, it } from "vitest";
import { formatBrandName } from "./brand-name";

describe("formatBrandName", () => {
  it("gives the names in the shop one consistent look", () => {
    const shown = [
      "HP",
      "LENOVO",
      "Modio",
      "PRINTERS",
      "BRAND NEW LAPTOPS",
      "DELL",
      "macbook",
      "all-in-one",
      "LENOVO TABLETS",
    ].map(formatBrandName);

    expect(shown).toEqual([
      "HP",
      "Lenovo",
      "Modio",
      "Printers",
      "Brand New Laptops",
      "Dell",
      "MacBook",
      "All-in-One",
      "Lenovo Tablets",
    ]);
  });

  it("keeps known acronyms and joining words right", () => {
    expect(formatBrandName("hp")).toBe("HP");
    expect(formatBrandName("Hp Inc")).toBe("HP Inc");
    expect(formatBrandName("ALL-IN-ONE PCS")).toBe("All-in-One Pcs");
    expect(formatBrandName("in")).toBe("In"); // a lone small word still starts with a capital
  });

  it("tidies spaces and copes with empty values", () => {
    expect(formatBrandName("  lenovo   tablets ")).toBe("Lenovo Tablets");
    expect(formatBrandName("")).toBe("");
    expect(formatBrandName(undefined)).toBe("");
    expect(formatBrandName(null)).toBe("");
  });
});
