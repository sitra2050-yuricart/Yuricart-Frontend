import type { Product } from "@/lib/api/types";
import {
  getBrandName,
  getProductEffectivePrice,
  getProductImageUrl,
  hasProductDiscount,
} from "@/lib/api/product-utils";

/**
 * The product model has no structured spec fields yet, so the product page
 * derives "Key specifications", the detailed specs table, warranty and
 * condition from the description / shortDescription text.
 */

export interface SpecRow {
  label: string;
  value: string;
}

export interface RailItem {
  slug: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
}

export interface CompareItem extends RailItem {
  inStock: boolean;
  brand?: string;
  specs: Record<string, string>;
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

export function formatKes(value: number): string {
  return `Kes ${Math.round(value).toLocaleString("en-US")}`;
}

export function htmlToLines(html?: string): string[] {
  if (!html) return [];
  const text = html
    .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, ": ")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h[1-6]|ul|ol|table)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m] ?? m);

  return text
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/[ \t]+/g, " ")
        // leading bullets, dashes and emoji
        .replace(/^[\s\-–•*·▪►➤]+/, "")
        .replace(/^(?:[☀-➿️]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF])+\s*/, "")
        .trim(),
    )
    .filter(Boolean);
}

export function parseSpecs(html?: string): SpecRow[] {
  const rows: SpecRow[] = [];
  const seen = new Set<string>();

  for (const line of htmlToLines(html)) {
    const match = line.match(/^([^:|]{2,40}?)\s*[:：]\s*(.{1,300})$/);
    if (!match) continue;
    const label = match[1].trim();
    const value = match[2].trim();
    if (!value || /https?:|\/\//i.test(label) || /^\/\//.test(value)) continue;
    if (label.split(/\s+/).length > 5) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ label, value });
  }

  return rows;
}

const KEY_SPEC_PRIORITY =
  /processor|cpu|chip|ram|memory|storage|ssd|hdd|display|screen|resolution|battery|camera|operating|os\b|graphics|network/i;

export function getKeySpecs(
  shortDescription: string | undefined,
  specs: SpecRow[],
): string[] {
  const fromShort = htmlToLines(shortDescription);
  if (fromShort.length >= 2) return fromShort.slice(0, 8);

  // Warranty and condition already have their own box beside the price.
  const candidates = specs.filter((s) => !/warrant|^condition$/i.test(s.label));

  if (candidates.length) {
    const preferred = candidates.filter((s) => KEY_SPEC_PRIORITY.test(s.label));
    const picked = (preferred.length >= 3 ? preferred : candidates).slice(0, 8);
    return picked.map((s) => `${s.label}: ${s.value}`);
  }

  return fromShort.slice(0, 1);
}

export function findSpec(specs: SpecRow[], pattern: RegExp): string | undefined {
  return specs.find((s) => pattern.test(s.label))?.value;
}

export function hasHtml(value?: string): boolean {
  return !!value && /<[a-z][\s\S]*>/i.test(value);
}

export function toRailItem(product: Product): RailItem {
  const discounted = hasProductDiscount(product);
  return {
    slug: product.slug,
    name: product.title,
    image: getProductImageUrl(product),
    price: formatKes(getProductEffectivePrice(product)),
    originalPrice: discounted ? formatKes(product.price) : undefined,
  };
}

export function toCompareItem(product: Product): CompareItem {
  const specs: Record<string, string> = {};
  parseSpecs(product.description).forEach((row) => {
    specs[row.label] = row.value;
  });
  return {
    ...toRailItem(product),
    inStock: product.stock > 0,
    brand: getBrandName(product.brand),
    specs,
  };
}
