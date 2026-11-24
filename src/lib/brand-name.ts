// Brand names are typed by hand in the admin, so the same shop shows "DELL", "macbook"
// and "all-in-one" side by side. This gives them one consistent look for display only;
// the stored name and the slug (used in links) are never changed.

const FIXED: Record<string, string> = {
  hp: "HP",
  lg: "LG",
  msi: "MSI",
  ibm: "IBM",
  macbook: "MacBook",
  ipad: "iPad",
  iphone: "iPhone",
};

// Joining words stay lower-case inside a name ("All-in-One"), but never at the start or end.
const SMALL = new Set(["in", "of", "and", "the", "for", "to", "on"]);

function titleWord(word: string): string {
  const fixed = FIXED[word.toLowerCase()];
  if (fixed) return fixed;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** "DELL" -> "Dell", "LENOVO TABLETS" -> "Lenovo Tablets", "macbook" -> "MacBook", "all-in-one" -> "All-in-One". */
export function formatBrandName(name: string | undefined | null): string {
  const clean = (name ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return "";

  // Split on spaces and hyphens but keep them, so the separators come back unchanged.
  const parts = clean.split(/([ -])/);
  const words = parts.map((part, index) => (part === " " || part === "-" ? null : index));
  const first = words.find((i) => i !== null) as number;
  const last = [...words].reverse().find((i) => i !== null) as number;

  return parts
    .map((part, index) => {
      if (part === " " || part === "-") return part;
      if (index !== first && index !== last && SMALL.has(part.toLowerCase())) return part.toLowerCase();
      return titleWord(part);
    })
    .join("");
}
