import { describe, expect, it } from "vitest";
import { analyzeRules, buildRulePayload, parseAreas, type DeliveryRule } from "./delivery-rules";

const rule = (over: Partial<DeliveryRule>): DeliveryRule => ({
  _id: "r1",
  name: "Nairobi",
  rate: 200,
  regions: ["Nairobi"],
  status: "active",
  ...over,
});

describe("analyzeRules", () => {
  it("flags no rules at all", () => {
    expect(analyzeRules([]).noRules).toBe(true);
    expect(analyzeRules([rule({ status: "inactive" })]).noRules).toBe(true);
  });

  it("flags rules with no 'everywhere else' rule", () => {
    const health = analyzeRules([rule({})]);
    expect(health.noRules).toBe(false);
    expect(health.noCatchAll).toBe(true);
  });

  it("is happy with an areas rule plus one catch-all", () => {
    const health = analyzeRules([rule({}), rule({ _id: "r2", name: "Rest", regions: [], rate: 800 })]);
    expect(health).toEqual({ noRules: false, noCatchAll: false, multipleCatchAll: false, duplicateAreas: [] });
  });

  it("flags more than one catch-all and areas used twice, ignoring case and inactive rules", () => {
    const health = analyzeRules([
      rule({ regions: ["Nairobi", "Westlands"] }),
      rule({ _id: "r2", regions: ["nairobi"] }),
      rule({ _id: "r3", regions: [] }),
      rule({ _id: "r4", regions: [] }),
      rule({ _id: "r5", regions: ["Westlands"], status: "inactive" }),
    ]);
    expect(health.multipleCatchAll).toBe(true);
    expect(health.duplicateAreas).toEqual(["nairobi"]);
  });
});

describe("parseAreas", () => {
  it("accepts lines and commas and removes blanks and duplicates", () => {
    expect(parseAreas("Nairobi CBD\n Westlands , nairobi cbd\n\n,Kilimani")).toEqual([
      "Nairobi CBD",
      "Westlands",
      "Kilimani",
    ]);
    expect(parseAreas("")).toEqual([]);
  });
});

describe("buildRulePayload", () => {
  const ok = { name: " Nairobi ", rate: "300", freeAbove: "", areas: "Nairobi\nWestlands", active: true };

  it("builds the API body, with no threshold as null (removes it)", () => {
    expect(buildRulePayload(ok).payload).toEqual({
      name: "Nairobi",
      rate: 300,
      freeAbove: null,
      regions: ["Nairobi", "Westlands"],
      status: "active",
    });
  });

  it("keeps a free-delivery threshold and an inactive flag", () => {
    const { payload } = buildRulePayload({ ...ok, freeAbove: "50000", active: false });
    expect(payload?.freeAbove).toBe(50000);
    expect(payload?.status).toBe("inactive");
  });

  it("allows a fee of 0 (free delivery zone) but not a blank or negative one", () => {
    expect(buildRulePayload({ ...ok, rate: "0" }).payload?.rate).toBe(0);
    expect(buildRulePayload({ ...ok, rate: "" }).errors.rate).toBeTruthy();
    expect(buildRulePayload({ ...ok, rate: "-5" }).errors.rate).toBeTruthy();
  });

  it("requires a name, and a threshold of 0 is rejected because it would mean always free", () => {
    expect(buildRulePayload({ ...ok, name: "  " }).errors.name).toBeTruthy();
    expect(buildRulePayload({ ...ok, freeAbove: "0" }).errors.freeAbove).toBeTruthy();
    expect(buildRulePayload({ ...ok, freeAbove: "abc" }).errors.freeAbove).toBeTruthy();
    expect(buildRulePayload({ ...ok, name: "" }).payload).toBeUndefined();
  });
});
