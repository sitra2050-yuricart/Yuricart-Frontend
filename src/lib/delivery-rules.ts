export interface DeliveryRule {
  _id: string;
  name: string;
  rate: number;
  freeAbove?: number | null;
  regions: string[];
  status: "active" | "inactive";
}

export interface RuleHealth {
  /** No active rules: orders are charged no delivery at all. */
  noRules: boolean;
  /** Rules exist but none covers "everywhere else": other cities get the cheapest rule's fee. */
  noCatchAll: boolean;
  /** More than one "everywhere else" rule: the cheapest silently wins. */
  multipleCatchAll: boolean;
  /** Areas listed in more than one active rule: the first match wins. */
  duplicateAreas: string[];
}

/** A rule with no areas applies to every place no other rule names. */
export const isCatchAll = (rule: DeliveryRule) => rule.regions.length === 0;

/** What is wrong with the current set of active rules, if anything. */
export function analyzeRules(rules: DeliveryRule[]): RuleHealth {
  const active = rules.filter((rule) => rule.status === "active");
  const catchAll = active.filter(isCatchAll);

  const owners = new Map<string, Set<string>>();
  for (const rule of active) {
    for (const region of rule.regions) {
      const key = region.trim().toLowerCase();
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key)!.add(rule._id);
    }
  }
  const duplicateAreas = [...owners.entries()]
    .filter(([, ids]) => ids.size > 1)
    .map(([key]) => key);

  return {
    noRules: active.length === 0,
    noCatchAll: active.length > 0 && catchAll.length === 0,
    multipleCatchAll: catchAll.length > 1,
    duplicateAreas,
  };
}

/** One area per line or comma-separated; trimmed, no blanks, no duplicates. */
export function parseAreas(text: string): string[] {
  const seen = new Set<string>();
  const areas: string[] = [];
  for (const part of text.split(/[\n,]/)) {
    const name = part.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    areas.push(name);
  }
  return areas;
}

export interface RuleFormValues {
  name: string;
  rate: string;
  freeAbove: string;
  areas: string;
  active: boolean;
}

export interface RuleFormResult {
  errors: Partial<Record<"name" | "rate" | "freeAbove", string>>;
  payload?: {
    name: string;
    rate: number;
    /** null removes the free-delivery threshold. */
    freeAbove: number | null;
    regions: string[];
    status: "active" | "inactive";
  };
}

/** Validates the form and builds the API body. */
export function buildRulePayload(values: RuleFormValues): RuleFormResult {
  const errors: RuleFormResult["errors"] = {};

  const name = values.name.trim();
  if (!name) errors.name = "Give the rule a name, like Nairobi CBD.";

  const rate = Number(values.rate);
  if (values.rate.trim() === "" || !Number.isFinite(rate) || rate < 0) {
    errors.rate = "Enter the delivery fee in KES, 0 or more.";
  }

  let freeAbove: number | null = null;
  if (values.freeAbove.trim() !== "") {
    const n = Number(values.freeAbove);
    if (!Number.isFinite(n) || n <= 0) {
      errors.freeAbove = "Leave empty for no free delivery, or enter an amount above 0.";
    } else {
      freeAbove = n;
    }
  }

  if (Object.keys(errors).length) return { errors };

  return {
    errors,
    payload: {
      name,
      rate,
      freeAbove,
      regions: parseAreas(values.areas),
      status: values.active ? "active" : "inactive",
    },
  };
}
